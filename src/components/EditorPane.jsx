import React, { useRef, useEffect } from 'react'
import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { registerPromptLanguage, registerAllMonacoThemes, PROMPT_LANGUAGE_ID } from '../lib/utils.js'

loader.config({ monaco })

export function EditorPane({ content, onChange, isSaved, variables = {}, fontSize = 12, monacoTheme = 'promptflow-dark' }) {
    const variablesRef = useRef(variables)
    const completionDisposable = useRef(null)

    // Keep the ref in sync with the latest variables without re-registering the provider
    useEffect(() => {
        variablesRef.current = variables
    }, [variables])

    useEffect(() => {
        return () => { completionDisposable.current?.dispose() }
    }, [])

    function handleEditorWillMount(monacoInstance) {
        registerPromptLanguage(monacoInstance)
        registerAllMonacoThemes(monacoInstance)

        // Dispose any previous registration (e.g. HMR re-mount)
        completionDisposable.current?.dispose()

        completionDisposable.current = monacoInstance.languages.registerCompletionItemProvider(
            PROMPT_LANGUAGE_ID,
            {
                triggerCharacters: ['{'],
                provideCompletionItems: (model, position) => {
                    const lineText = model.getValueInRange({
                        startLineNumber: position.lineNumber,
                        startColumn: 1,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    })

                    // Match a partial `{`, `{{`, or `{{partialName` at end of line
                    const match = lineText.match(/\{+\w*$/)
                    if (!match) return { suggestions: [] }

                    const typedSoFar = match[0]
                    const startColumn = position.column - typedSoFar.length
                    const vars = variablesRef.current

                    const range = {
                        startLineNumber: position.lineNumber,
                        startColumn,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    }

                    return {
                        suggestions: Object.keys(vars).map(name => ({
                            label: `{{${name}}}`,
                            kind: monacoInstance.languages.CompletionItemKind.Variable,
                            insertText: `{{${name}}}`,
                            detail: vars[name] ? `"${vars[name]}"` : 'variable',
                            sortText: '0',
                            range,
                        })),
                    }
                },
            }
        )
    }

    return (
        <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            borderRight: '0.5px solid var(--color-border)', minWidth: 0,
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 14px', height: 40,
                borderBottom: '0.5px solid var(--color-border)',
                background: 'var(--color-bg-secondary)', flexShrink: 0,
            }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    prompt.txt
                </span>
                <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: isSaved ? 'var(--color-green)' : 'var(--color-amber)',
                    opacity: 0.8,
                }} />
            </div>

            {/* Monaco Editor */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Editor
                    height="100%"
                    language={PROMPT_LANGUAGE_ID}
                    theme={monacoTheme}
                    value={content}
                    onChange={onChange}
                    beforeMount={handleEditorWillMount}
                    options={{
                        fontSize,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontLigatures: true,
                        lineHeight: 20,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        padding: { top: 14, bottom: 14 },
                        renderLineHighlight: 'line',
                        lineNumbers: 'on',
                        glyphMargin: false,
                        folding: false,
                        lineDecorationsWidth: 4,
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        scrollbar: {
                            verticalScrollbarSize: 4,
                            horizontalScrollbarSize: 4,
                        },
                        quickSuggestions: false,
                        parameterHints: { enabled: false },
                        suggestOnTriggerCharacters: true,
                    }}
                />
            </div>
        </div>
    )
}
