"""Real Chromium behavior checks against the built static application.
Run: npm run build && python3 tests/browser.py
Set CHROMIUM_PATH for a preinstalled cloud browser; otherwise install Playwright Chromium.
"""
import json
import os
from pathlib import Path
import subprocess
import time
import unittest
import urllib.request
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / 'work/browser'
ARTIFACTS.mkdir(parents=True, exist_ok=True)


class BrowserChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.log = (ARTIFACTS / 'server.log').open('w')
        cls.server = subprocess.Popen(['npm', 'run', 'preview', '--', '--host', '127.0.0.1', '--port', '5175', '--strictPort'], cwd=ROOT, stdout=cls.log, stderr=subprocess.STDOUT)
        for _ in range(100):
            try:
                urllib.request.urlopen('http://127.0.0.1:5175', timeout=1)
                break
            except Exception:
                time.sleep(.1)
        else:
            cls.server.terminate()
            raise RuntimeError('Preview did not start')
        cls.runtime = sync_playwright().start()
        cls.browser = cls.runtime.chromium.launch(headless=True, executable_path=os.getenv('CHROMIUM_PATH'), args=['--no-sandbox'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.runtime.stop()
        cls.server.terminate()
        cls.server.wait(timeout=10)
        cls.log.close()

    def setUp(self):
        self.context = self.browser.new_context(viewport={'width': 1440, 'height': 1000})
        self.context.route('**/*', lambda route: route.continue_() if route.request.url.startswith('http://127.0.0.1:5175') else route.abort())
        self.page = self.context.new_page()
        self.errors = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))
        self.page.goto('http://127.0.0.1:5175')

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [])

    def test_label_copy_save_reload_replace_delete_reset(self):
        page = self.page
        page.get_by_label('Button label', exact=True).fill('<b>Ship it</b>')
        expect(page.locator('.custom-button')).to_have_text('<b>Ship it</b>')
        self.assertEqual(page.locator('.custom-button b').count(), 0)
        page.evaluate("() => { navigator.clipboard.writeText = async text => { window.copied = text } }")
        page.get_by_role('button', name='Copy CSS', exact=True).click()
        expect(page.get_by_text('Copied.', exact=True)).to_be_visible()
        self.assertIn('.custom-button', page.evaluate('window.copied'))
        page.get_by_role('button', name='Save preset', exact=True).click()
        page.get_by_role('button', name='Save', exact=True).click()
        expect(page.get_by_text('Use 1–40 characters after trimming.')).to_be_visible()
        page.get_by_label('Preset name').fill('  Work preset  ')
        page.get_by_role('button', name='Save', exact=True).click()
        expect(page.get_by_role('button', name='Save preset', exact=True)).to_be_focused()
        page.reload()
        page.get_by_role('button', name='Work preset', exact=True).click()
        expect(page.locator('.custom-button')).to_have_text('<b>Ship it</b>')
        page.get_by_role('button', name='Save preset', exact=True).click()
        page.get_by_label('Preset name').fill('Work preset')
        expect(page.get_by_role('button', name='Replace preset')).to_be_visible()
        page.get_by_role('button', name='Replace preset').click()
        self.assertEqual(page.get_by_role('button', name='Work preset', exact=True).count(), 1)
        page.get_by_role('button', name='Delete preset Work preset').click()
        page.get_by_role('button', name='Undo delete').click()
        expect(page.get_by_role('button', name='Work preset', exact=True)).to_be_visible()
        page.get_by_role('button', name='Reset', exact=True).click()
        expect(page.get_by_label('Button label', exact=True)).to_have_value('Save changes')
        expect(page.get_by_role('button', name='LUM / Neutral')).to_have_attribute('aria-pressed', 'true')

    def test_undo_at_capacity_preserves_saved_collection_and_can_retry(self):
        page = self.page
        page.get_by_role('button', name='Save preset', exact=True).click()
        page.get_by_label('Preset name').fill('Seed')
        page.get_by_role('button', name='Save', exact=True).click()
        page.evaluate("""() => {
            const seed = JSON.parse(localStorage.getItem('button-presets'))[0];
            localStorage.setItem('button-presets', JSON.stringify(Array.from({length:100}, (_, i) => ({...seed, id:`custom-${i}`, name:`Preset ${i}`}))));
        }""")
        page.reload()
        original = page.evaluate("JSON.parse(localStorage.getItem('button-presets'))[0]")
        page.get_by_role('button', name='Delete preset Preset 0', exact=True).click()
        page.get_by_role('button', name='Save preset', exact=True).click()
        page.get_by_label('Preset name').fill('New preset')
        page.get_by_role('button', name='Save', exact=True).click()
        before = page.evaluate("localStorage.getItem('button-presets')")
        self.assertEqual(len(json.loads(before)), 100)
        page.get_by_role('button', name='Undo delete', exact=True).click()
        self.assertEqual(page.evaluate("localStorage.getItem('button-presets')"), before)
        expect(page.get_by_text('100 presets saved. Delete another preset, then retry Undo delete.')).to_be_visible()
        expect(page.get_by_role('button', name='Undo delete', exact=True)).to_be_enabled()
        page.get_by_role('button', name='Delete preset Preset 1', exact=True).click()
        page.get_by_role('button', name='Undo delete', exact=True).click()
        restored = json.loads(page.evaluate("localStorage.getItem('button-presets')"))
        self.assertEqual(len(restored), 100)
        expected = [preset for preset in json.loads(before) if preset['id'] != 'custom-1'] + [original]
        self.assertEqual(restored, expected)
        self.assertIn('custom-0', [p['id'] for p in restored])
        self.assertNotIn('custom-1', [p['id'] for p in restored])
        self.assertIn('New preset', [p['name'] for p in restored])
        page.reload()
        expect(page.get_by_role('button', name='Preset 0', exact=True)).to_be_visible()
        expect(page.get_by_role('button', name='New preset', exact=True)).to_be_visible()
        self.assertEqual(page.get_by_text('Saved presets could not be read.', exact=False).count(), 0)

    def test_malformed_persisted_css_recovers_without_overwriting_storage(self):
        page = self.page
        page.get_by_role('button', name='Save preset', exact=True).click()
        page.get_by_label('Preset name').fill('Seed')
        page.get_by_role('button', name='Save', exact=True).click()
        raw = page.evaluate("""() => {
            const presets = JSON.parse(localStorage.getItem('button-presets'));
            presets[0].config.background.color = '#12345';
            localStorage.setItem('button-presets', JSON.stringify(presets));
            return localStorage.getItem('button-presets');
        }""")
        page.reload()
        expect(page.get_by_text('Saved presets could not be read.', exact=False)).to_be_visible()
        expect(page.locator('.custom-button')).to_be_enabled()
        self.assertEqual(page.evaluate("localStorage.getItem('button-presets')"), raw)
        page.get_by_label('Button label', exact=True).fill('Still usable')
        expect(page.locator('.custom-button')).to_have_text('Still usable')
        expect(page.get_by_label('Generated code')).to_contain_text('background: var(--acc)')
        expect(page.get_by_label('Generated code')).not_to_contain_text('#12345')
        page.screenshot(path=str(ARTIFACTS / 'malformed-preset-recovery.png'), full_page=True)

    def test_native_clipboard(self):
        self.context.grant_permissions(['clipboard-read', 'clipboard-write'], origin='http://127.0.0.1:5175')
        self.page.get_by_role('button', name='Copy CSS', exact=True).click()
        expect(self.page.get_by_text('Copied.', exact=True)).to_be_visible()
        self.assertIn('.custom-button', self.page.evaluate('navigator.clipboard.readText()'))

    def test_keyboard_states_and_native_input(self):
        page = self.page
        button = page.locator('.custom-button')
        button.hover()
        self.assertEqual(button.evaluate('(el) => getComputedStyle(el).filter'), 'brightness(1.12)')
        page.mouse.move(0, 0)
        for _ in range(20):
            page.keyboard.press('Tab')
            if button.evaluate('(el) => el === document.activeElement'):
                break
        expect(button).to_be_focused()
        page.keyboard.press('Enter')
        page.keyboard.press('Space')
        expect(page.get_by_text('Preview activated 2 times.')).to_be_visible()
        self.assertEqual(button.evaluate('(el) => getComputedStyle(el).outlineStyle'), 'solid')
        for state in ['disabled', 'loading']:
            page.get_by_role('radio', name=state, exact=True).check()
            expect(button).to_be_disabled()
        expect(button).to_have_attribute('aria-busy', 'true')
        page.get_by_role('radio', name='default', exact=True).check()
        page.get_by_role('radio', name='default', exact=True).focus()
        page.keyboard.press('ArrowRight')
        expect(page.get_by_role('radio', name='hover', exact=True)).to_be_checked()
        page.get_by_role('button', name='Save preset', exact=True).click()
        expect(page.get_by_label('Preset name')).to_be_focused()
        page.keyboard.press('Escape')
        expect(page.get_by_role('button', name='Save preset', exact=True)).to_be_focused()
        page.get_by_role('button', name='Library', exact=True).click()
        page.get_by_role('button', name='Primary', exact=True).focus()
        page.keyboard.press('Space')
        expect(page.get_by_text('Activated 1 times.')).to_be_visible()
        page.get_by_label('Example label', exact=True).fill('Native Vue')
        page.keyboard.press('Enter')
        expect(page.get_by_text('Submitted: Native Vue')).to_be_visible()

    def test_storage_and_clipboard_failure(self):
        page = self.page
        page.evaluate("localStorage.setItem('button-presets', '[{}]')")
        page.reload()
        expect(page.get_by_text('Saved presets could not be read.', exact=False)).to_be_visible()
        page.evaluate("() => { Object.defineProperty(Storage.prototype, 'setItem', { value: () => { throw Error('denied') } }); navigator.clipboard.writeText = async () => { throw Error('denied') } }")
        page.get_by_role('button', name='Copy CSS', exact=True).click()
        expect(page.get_by_text('Copy unavailable.', exact=False)).to_be_visible()
        expect(page.get_by_label('Generated code')).to_be_visible()
        page.get_by_role('button', name='Save preset', exact=True).click()
        page.get_by_label('Preset name').fill('Unsaved')
        page.get_by_role('button', name='Save', exact=True).click()
        expect(page.get_by_text('Preset was not saved;', exact=False)).to_be_visible()
        expect(page.get_by_role('dialog')).to_be_visible()
        page.get_by_role('button', name='Cancel', exact=True).click()
        self.assertEqual(page.get_by_role('button', name='Unsaved', exact=True).count(), 0)
        page.add_init_script("Object.defineProperty(Storage.prototype, 'getItem', { value: () => { throw Error('denied') } })")
        page.reload()
        expect(page.get_by_text('Saved presets could not be read.', exact=False)).to_be_visible()
        page.get_by_role('button', name='Reset', exact=True).click()
        expect(page.locator('.custom-button')).to_be_enabled()

    def test_widths_themes_motion_and_controls(self):
        page = self.page
        for width in [320, 768, 1440]:
            page.set_viewport_size({'width': width, 'height': 1000})
            for theme in ['light', 'dark']:
                page.get_by_label('Theme', exact=True).select_option(theme)
                self.assertLessEqual(page.evaluate('document.documentElement.scrollWidth'), width)
                self.assertGreaterEqual(page.locator('.custom-button').bounding_box()['height'], 44)
                if theme == 'dark':
                    self.assertEqual(page.locator('.custom-button').evaluate('(el) => getComputedStyle(el).backgroundColor'), 'rgb(214, 168, 40)')
                page.screenshot(path=str(ARTIFACTS / f'lab-{width}-{theme}.png'), full_page=True)
            for group in ['Effects', 'Transform', 'Layout', 'Style']:
                page.get_by_label('Control group').select_option(group)
                for control in page.locator('.controls input, .controls select').all():
                    self.assertTrue(control.evaluate('(el) => !!el.labels?.length'))
        page.emulate_media(reduced_motion='reduce')
        page.get_by_text('Explore effects', exact=True).click()
        page.get_by_role('button', name='Apex Glow', exact=False).click()
        self.assertEqual(page.locator('.custom-button').evaluate('(el) => getComputedStyle(el).animationName'), 'none')
        self.assertEqual(page.locator('.custom-button').evaluate('(el) => getComputedStyle(el).transitionDuration'), '0s')
        page.get_by_label('Control group').select_option('Transform')
        page.get_by_label('Scale:', exact=False).fill('150')
        expect(page.get_by_label('Generated code')).to_contain_text('scale(1.5)')
        page.get_by_label('Format', exact=False).select_option('Tailwind')
        expect(page.get_by_label('Generated code')).to_contain_text('[transform:')
        (ARTIFACTS / 'results.json').write_text(json.dumps({'widths':[320,768,1440], 'themes':['light','dark'], 'reduced_motion':True}))


if __name__ == '__main__':
    unittest.main(verbosity=2)
