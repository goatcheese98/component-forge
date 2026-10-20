import { ButtonTestingLab, ThemeSelector, Icon, generateCSSCode, parseButtonState, parsePresets, serializePresets, type ButtonTestState } from '../../dist/index'
const renderCSS = (state: ButtonTestState): string => generateCSSCode(state)
void [ButtonTestingLab, ThemeSelector, Icon, renderCSS]
const renderExternal = (value: unknown): string => generateCSSCode(parseButtonState(value))
const roundtrip = (raw: string): string => serializePresets(parsePresets(raw))
void [renderExternal, roundtrip]
