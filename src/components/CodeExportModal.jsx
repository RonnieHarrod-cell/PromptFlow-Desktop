import React, { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { generateCode, INSTALL_HINTS } from '../lib/codeExport.js'

const LANGS = [
    { id: 'curl',       label: 'cURL' },
    { id: 'python',     label: 'Python' },
    { id: 'javascript', label: 'JavaScript' },
]

export function CodeExportModal({ onClose, provider, model, systemPrompt, userPrompt, temperature, topP }) {
    const [lang, setLang] = useState('python')
    const [copied, setCopied] = useState(false)

    const code = generateCode(lang, { provider, model, systemPrompt, userPrompt, temperature, topP })
    const installHint = lang !== 'curl' ? INSTALL_HINTS[provider]?.[lang] : null

    async function handleCopy() {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div
            style={overlay}
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
            <div style={modal}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        Export code
                    </span>
                    <div style={{ flex: 1 }} />
                    <button onClick={onClose} style={iconBtn}>
                        <X size={14} strokeWidth={2} />
                    </button>
                </div>

                {/* Language tabs */}
                <div style={{
                    display: 'flex', gap: 2, marginBottom: 12,
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 8, padding: 3,
                    border: '0.5px solid var(--color-border)',
                }}>
                    {LANGS.map(l => (
                        <button
                            key={l.id}
                            onClick={() => setLang(l.id)}
                            style={{
                                flex: 1, padding: '5px 0', borderRadius: 6, border: 'none',
                                fontSize: 11, fontWeight: 500, cursor: 'pointer',
                                background: lang === l.id ? 'rgba(124,108,252,0.2)' : 'transparent',
                                color: lang === l.id ? '#9d91fd' : 'var(--color-text-muted)',
                                transition: 'background 0.1s, color 0.1s',
                            }}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>

                {/* Code block */}
                <div style={{ position: 'relative' }}>
                    <pre style={{
                        margin: 0, padding: '14px 16px',
                        background: 'var(--color-bg-primary)',
                        border: '0.5px solid var(--color-border)',
                        borderRadius: 8, overflowX: 'auto',
                        fontSize: 11.5, lineHeight: 1.65,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        color: 'var(--color-text-secondary)',
                        maxHeight: 380, overflowY: 'auto',
                        whiteSpace: 'pre',
                    }}>
                        {code}
                    </pre>

                    <button
                        onClick={handleCopy}
                        title={copied ? 'Copied!' : 'Copy to clipboard'}
                        style={{
                            position: 'absolute', top: 8, right: 8,
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '4px 9px', borderRadius: 6,
                            fontSize: 10, fontWeight: 500, cursor: 'pointer',
                            background: copied ? 'rgba(62,207,142,0.15)' : 'rgba(255,255,255,0.07)',
                            border: `0.5px solid ${copied ? 'rgba(62,207,142,0.3)' : 'var(--color-border-strong)'}`,
                            color: copied ? 'var(--color-green)' : 'var(--color-text-secondary)',
                            transition: 'all 0.15s',
                        }}
                    >
                        {copied
                            ? <><Check size={10} strokeWidth={2.5} /> Copied</>
                            : <><Copy size={10} strokeWidth={2} /> Copy</>
                        }
                    </button>
                </div>

                {/* Install hint */}
                {installHint && (
                    <div style={{
                        marginTop: 10, display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 12px', borderRadius: 7,
                        background: 'rgba(255,255,255,0.03)',
                        border: '0.5px solid var(--color-border)',
                    }}>
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Install:</span>
                        <code style={{
                            fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                            color: 'var(--color-amber)',
                        }}>
                            {installHint}
                        </code>
                    </div>
                )}
            </div>
        </div>
    )
}

const overlay = {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const modal = {
    background: 'var(--color-bg-elevated)',
    border: '0.5px solid var(--color-border-strong)',
    borderRadius: 14, padding: '22px 24px',
    width: 560,
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
}

const iconBtn = {
    background: 'none', border: 'none',
    color: 'var(--color-text-muted)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', padding: 4, borderRadius: 4,
}
