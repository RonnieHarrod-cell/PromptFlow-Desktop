/**
 * Inject variables into a prompt template.
 * Replaces {{variable_name}} with the corresponding value.
 */
export function injectVariables(template, variables) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] !== undefined ? variables[key] : match
    })
}

/**
 * Extract all variable names from a template string.
 */
export function extractVariables(template) {
    const matches = template.matchAll(/\{\{(\w+)\}\}/g)
    return [...new Set([...matches].map(m => m[1]))]
}

/**
 * Rough token count estimate (4 chars ≈ 1 token).
 */
export function estimateTokens(text) {
    return Math.ceil(text.length / 4)
}

/**
 * Format a token count for display.
 */
export function formatTokens(count, limit = 1000) {
    return `${count} / ${limit >= 1000 ? `${limit / 1000}k` : limit}`
}

/**
 * Monaco editor tokenizer language config for prompt templates.
 */
export const PROMPT_LANGUAGE_ID = 'promptflow'

export function registerAllMonacoThemes(monaco) {
    const variants = [
        {
            name: 'promptflow-darker',
            bg: '#131316', lineHL: '#1a1a1f', indent: '#1e1e24',
            lineNum: '#4e4e5a', lineNumActive: '#8e8e9a',
        },
        {
            name: 'promptflow-midnight',
            bg: '#161b22', lineHL: '#1c2230', indent: '#22293a',
            lineNum: '#4a5568', lineNumActive: '#8b9eb8',
        },
        {
            name: 'promptflow-mocha',
            bg: '#252019', lineHL: '#2c261f', indent: '#332e26',
            lineNum: '#5e5242', lineNumActive: '#a0927a',
        },
    ]

    const sharedRules = [
        { token: 'variable', foreground: '#F59E0B', fontStyle: 'bold' },
        { token: 'comment',  foreground: '#606070' },
        { token: 'string',   foreground: '#3ecf8e' },
    ]

    variants.forEach(({ name, bg, lineHL, indent, lineNum, lineNumActive }) => {
        monaco.editor.defineTheme(name, {
            base: 'vs-dark',
            inherit: true,
            rules: sharedRules,
            colors: {
                'editor.background':                  bg,
                'editor.foreground':                  '#e8e8ed',
                'editorLineNumber.foreground':         lineNum,
                'editorLineNumber.activeForeground':   lineNumActive,
                'editor.lineHighlightBackground':      lineHL,
                'editorCursor.foreground':             '#7c6cfc',
                'editor.selectionBackground':          '#7c6cfc33',
                'editorIndentGuide.background':        indent,
            },
        })
    })
}

export function registerPromptLanguage(monaco) {
    monaco.languages.register({ id: PROMPT_LANGUAGE_ID })

    monaco.languages.setMonarchTokensProvider(PROMPT_LANGUAGE_ID, {
        tokenizer: {
            root: [
                [/\{\{[^}]+\}\}/, 'variable'],
                [/^#.*$/, 'comment'],
                [/"[^"]*"/, 'string'],
                [/'[^']*'/, 'string'],
            ],
        },
    })

    monaco.editor.defineTheme('promptflow-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'variable', foreground: '#F59E0B', fontStyle: 'bold' },
            { token: 'comment', foreground: '#606070' },
            { token: 'string', foreground: '#3ecf8e' },
        ],
        colors: {
            'editor.background': '#22222a',
            'editor.foreground': '#eaeaef',
            'editorLineNumber.foreground': '#606070',
            'editorLineNumber.activeForeground': '#9494a4',
            'editor.lineHighlightBackground': '#28282f',
            'editorCursor.foreground': '#7c6cfc',
            'editor.selectionBackground': '#7c6cfc33',
            'editorIndentGuide.background': '#2e2e38',
        },
    })
}