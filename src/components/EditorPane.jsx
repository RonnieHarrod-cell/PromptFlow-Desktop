import React, { useEffect, useRef } from 'react'
import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { registerPromptLanguage, PROMPT_LANGUAGE_ID } from '../lib/utils.js'

// Configure monaco to load locally
loader.config({ monaco })

export function EditorPane({ content, onChange, isSaved }) {
    const monacoRef = useRef(null)

    function handleEditorWillMount(monaco) {
        registerPromptLanguage(monaco)
    }

    function handleEditorDidMount(editor, monaco) {
        monacoRef.current = monaco
    }

    return (
        <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            borderRight: '0.5px solid var(--color-border)', minWidth: 0,
        }}>
            {/* Pane header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0 12px', height: '32px',
                borderBottom: '0.5px solid var(--color-border)',
                background: 'var(--color-bg-secondary)', flexShrink: 0,
            }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>prompt.txt</span>
                <span style={{
                    fontSize: '10px', padding: '1px 7px', borderRadius: '100px',
                    background: isSaved ? 'var(--color-green-dim)' : 'var(--color-amber-dim)',
                    color: isSaved ? 'var(--color-green)' : 'var(--color-amber)',
                }}>
                    {isSaved ? 'saved' : 'unsaved'}
                </span>
                <div style={{ flex: 1 }} />
                <span style={{
                    fontSize: '10px', padding: '1px 7px', borderRadius: '100px',
                    background: 'var(--color-accent-dim)', color: 'var(--color-accent)',
                }}>
                    system + user
                </span>
            </div>

            {/* Monaco Editor */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Editor
                    height="100%"
                    language={PROMPT_LANGUAGE_ID}
                    theme="promptflow-dark"
                    value={content}
                    onChange={onChange}
                    beforeMount={handleEditorWillMount}
                    onMount={handleEditorDidMount}
                    options={{
                        fontSize: 12,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontLigatures: true,
                        lineHeight: 20,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        padding: { top: 12, bottom: 12 },
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
                        suggest: { enabled: false },
                        quickSuggestions: false,
                        parameterHints: { enabled: false },
                    }}
                />
            </div>
        </div>
    )
}