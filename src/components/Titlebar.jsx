import React from 'react'
import { Play, Square, Settings, Code2 } from 'lucide-react'
import { PROVIDERS, PROVIDER_IDS } from '../lib/providers.js'

const isElectron = () => typeof window !== 'undefined' && !!window.electron

function TrafficLights() {
    const inElectron = isElectron()
    const lights = [
        { color: '#EF6C6B', action: () => window.electron?.window.close() },
        { color: '#F5BF4F', action: () => window.electron?.window.minimize() },
        { color: '#62C554', action: () => window.electron?.window.maximize() },
    ]
    return (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {lights.map((l, i) => (
                <div
                    key={i}
                    onClick={inElectron ? l.action : undefined}
                    style={{
                        width: 12, height: 12, borderRadius: '50%',
                        background: l.color, cursor: inElectron ? 'pointer' : 'default',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.filter = '' }}
                />
            ))}
        </div>
    )
}

export function TitleBar({
    provider, onProviderChange, model, onModelChange,
    apiKey, onApiKeyChange,
    onRun, onStop, isStreaming,
    tokenCount, tokenLimit = 1000,
    onOpenSettings,
    onOpenExport,
    // onSave, onFork, onNewPrompt available via native macOS menu
}) {
    const currentProvider = PROVIDERS[provider] || PROVIDERS.anthropic
    const pct = Math.min(100, (tokenCount / tokenLimit) * 100)
    const tokenColor = pct > 80 ? '#f87171' : pct > 60 ? '#f59e0b' : 'rgba(255,255,255,0.18)'

    function handleProviderChange(e) {
        const p = e.target.value
        onProviderChange(p)
        onModelChange(PROVIDERS[p].models[0].id)
    }

    return (
        <div style={{
            height: 44, flexShrink: 0, userSelect: 'none',
            background: 'var(--color-bg-secondary)',
            borderBottom: '0.5px solid var(--color-border)',
            display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
        }}>
            <TrafficLights />

            <span style={{
                fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em',
                color: 'var(--color-text-primary)', paddingLeft: 4,
                WebkitAppRegion: 'drag',
            }}>
                Prompt<span style={{ color: 'var(--color-accent)' }}>Flow</span>
            </span>

            <div style={{ flex: 1, WebkitAppRegion: 'drag' }} />

            {/* Provider + Model selector */}
            <div style={{
                display: 'flex', alignItems: 'center',
                background: 'rgba(255,255,255,0.03)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
            }}>
                <select
                    value={provider}
                    onChange={handleProviderChange}
                    style={{ ...selStyle, borderRight: '0.5px solid rgba(255,255,255,0.08)' }}
                >
                    {PROVIDER_IDS.map(id => (
                        <option key={id} value={id}>{PROVIDERS[id].label}</option>
                    ))}
                </select>
                <select
                    value={model}
                    onChange={e => onModelChange(e.target.value)}
                    style={selStyle}
                >
                    {currentProvider.models.map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                </select>
            </div>

            {/* API Key */}
            <input
                type="password"
                value={apiKey}
                onChange={e => onApiKeyChange(e.target.value)}
                placeholder="API key"
                style={{
                    width: 130, fontSize: 11, padding: '5px 10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, color: 'rgba(255,255,255,0.4)',
                    outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(124,108,252,0.5)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />

            {/* Token meter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 36, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: tokenColor, transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: tokenColor, minWidth: 44, textAlign: 'right' }}>
                    {tokenCount >= 1000 ? `${(tokenCount / 1000).toFixed(1)}k` : tokenCount}
                </span>
            </div>

            {/* Code export */}
            <button
                onClick={onOpenExport}
                title="Export code"
                style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 6,
                    color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-secondary)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
            >
                <Code2 size={14} strokeWidth={1.75} />
            </button>

            {/* Settings */}
            <button
                onClick={onOpenSettings}
                title="Settings"
                style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 6,
                    color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-secondary)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
            >
                <Settings size={14} strokeWidth={1.75} />
            </button>

            {/* Run / Stop */}
            {isStreaming ? (
                <button
                    onClick={onStop}
                    style={{ ...runBtn, background: 'rgba(248,113,113,0.1)', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
                >
                    <Square size={10} strokeWidth={2.5} />
                    Stop
                </button>
            ) : (
                <button onClick={onRun} style={runBtn}>
                    <Play size={10} strokeWidth={2.5} />
                    Run
                </button>
            )}
        </div>
    )
}

const selStyle = {
    fontSize: 11, background: 'transparent', border: 'none',
    color: 'rgba(255,255,255,0.45)', cursor: 'pointer', outline: 'none',
    padding: '5px 10px', fontFamily: 'inherit',
}

const runBtn = {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 7,
    background: 'rgba(124,108,252,0.15)', color: '#9d91fd',
    border: '0.5px solid rgba(124,108,252,0.3)', cursor: 'pointer',
}
