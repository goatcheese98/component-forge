import { ButtonTestingLab, ThemeSelector, Icon, generateCSSCode, type ButtonTestState } from '../../dist/index'
const renderCSS = (state: ButtonTestState): string => generateCSSCode(state)
void [ButtonTestingLab, ThemeSelector, Icon, renderCSS]
