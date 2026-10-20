"""Exercise the patched cloud dev and test-UI servers; never opens a desktop browser."""
import json
import os
from pathlib import Path
import signal
import subprocess
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'work/browser'
OUT.mkdir(parents=True, exist_ok=True)
results = []


def check(name, command, probes):
    with (OUT / f'{name}.log').open('w') as log:
        process = subprocess.Popen(command, cwd=ROOT, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
        try:
            deadline = time.monotonic() + 25
            while True:
                if process.poll() is not None:
                    raise RuntimeError(f'{name} exited before its HTTP probes passed; see {name}.log')
                try:
                    for url, marker in probes:
                        with urllib.request.urlopen(url, timeout=2) as response:
                            body = response.read().decode()
                            if response.status != 200 or marker not in body:
                                raise ValueError(f'{name}: expected content missing at {url}')
                    break
                except Exception:
                    if time.monotonic() > deadline:
                        raise
                    time.sleep(.2)
            results.append({'server': name, 'exit': 0, 'probes': [url for url, _ in probes]})
        finally:
            try:
                os.killpg(process.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            try:
                process.wait(timeout=8)
            except subprocess.TimeoutExpired:
                os.killpg(process.pid, signal.SIGKILL)
                process.wait(timeout=5)


check('vite-dev', ['npm', 'run', 'dev', '--', '--host', '127.0.0.1', '--port', '5180', '--strictPort'], [
    ('http://127.0.0.1:5180/', 'Component Forge'),
    ('http://127.0.0.1:5180/daisy-ui-lab/App.vue', 'ButtonTestingLab'),
])
check('vitest-ui', ['npm', 'run', 'test:ui', '--', '--watch', '--api.port=51204', '--no-open'], [
    ('http://127.0.0.1:51204/__vitest__/', 'Vitest'),
])
(OUT / 'server-smoke.json').write_text(json.dumps(results, indent=2) + '\n')
print(json.dumps(results))
