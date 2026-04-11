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
            { token: 'variable', foreground: 'F59E0B', fontStyle: 'bold' },
            { token: 'comment', foreground: '4e4e5a' },
            { token: 'string', foreground: '3ecf8e' },
        ],
        colors: {
            'editor.background': '#131316',
            'editor.foreground': '#e8e8ed',
            'editorLineNumber.foreground': '#4e4e5a',
            'editorLineNumber.activeForeground': '#8e8e9a',
            'editor.lineHighlightBackground': '#1a1a1f',
            'editorCursor.foreground': '#7c6cfc',
            'editor.selectionBackground': '#7c6cfc33',
            'editorIndentGuide.background': '#1e1e24',
        },
    })
}