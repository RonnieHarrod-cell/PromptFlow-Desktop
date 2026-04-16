export const THEMES = {
    default: {
        id: 'default',
        label: 'Default',
        monacoTheme: 'promptflow-dark',
        vars: {
            '--color-bg-primary':     '#1c1c23',
            '--color-bg-secondary':   '#22222a',
            '--color-bg-tertiary':    '#28282f',
            '--color-bg-elevated':    '#2e2e38',
            '--color-border':         'rgba(255,255,255,0.09)',
            '--color-border-strong':  'rgba(255,255,255,0.15)',
            '--color-text-primary':   '#eaeaef',
            '--color-text-secondary': '#9494a4',
            '--color-text-muted':     '#606070',
        },
        preview: { bg: '#22222a', bar: '#1c1c23', line1: '#2e2e38', line2: '#28282f' },
    },
    darker: {
        id: 'darker',
        label: 'Darker',
        monacoTheme: 'promptflow-darker',
        vars: {
            '--color-bg-primary':     '#0d0d0f',
            '--color-bg-secondary':   '#131316',
            '--color-bg-tertiary':    '#1a1a1f',
            '--color-bg-elevated':    '#1e1e24',
            '--color-border':         'rgba(255,255,255,0.07)',
            '--color-border-strong':  'rgba(255,255,255,0.12)',
            '--color-text-primary':   '#e8e8ed',
            '--color-text-secondary': '#8e8e9a',
            '--color-text-muted':     '#4e4e5a',
        },
        preview: { bg: '#131316', bar: '#0d0d0f', line1: '#1e1e24', line2: '#1a1a1f' },
    },
    midnight: {
        id: 'midnight',
        label: 'Midnight',
        monacoTheme: 'promptflow-midnight',
        vars: {
            '--color-bg-primary':     '#0e1117',
            '--color-bg-secondary':   '#161b22',
            '--color-bg-tertiary':    '#1c2230',
            '--color-bg-elevated':    '#22293a',
            '--color-border':         'rgba(255,255,255,0.08)',
            '--color-border-strong':  'rgba(255,255,255,0.13)',
            '--color-text-primary':   '#e6edf3',
            '--color-text-secondary': '#8b9eb8',
            '--color-text-muted':     '#4a5568',
        },
        preview: { bg: '#161b22', bar: '#0e1117', line1: '#22293a', line2: '#1c2230' },
    },
    mocha: {
        id: 'mocha',
        label: 'Mocha',
        monacoTheme: 'promptflow-mocha',
        vars: {
            '--color-bg-primary':     '#1e1a18',
            '--color-bg-secondary':   '#252019',
            '--color-bg-tertiary':    '#2c261f',
            '--color-bg-elevated':    '#332e26',
            '--color-border':         'rgba(255,220,180,0.07)',
            '--color-border-strong':  'rgba(255,220,180,0.12)',
            '--color-text-primary':   '#ede8e0',
            '--color-text-secondary': '#a0927a',
            '--color-text-muted':     '#5e5242',
        },
        preview: { bg: '#252019', bar: '#1e1a18', line1: '#332e26', line2: '#2c261f' },
    },
}

export const DEFAULT_THEME_ID = 'default'

export function applyTheme(themeId) {
    const theme = THEMES[themeId] ?? THEMES[DEFAULT_THEME_ID]
    const root = document.documentElement
    Object.entries(theme.vars).forEach(([prop, value]) => root.style.setProperty(prop, value))
}
