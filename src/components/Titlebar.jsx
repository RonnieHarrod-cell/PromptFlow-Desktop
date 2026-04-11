import React, { useState, useEffect, useRef, useCallback } from 'react'
import { PROVIDERS, PROVIDER_IDS } from '../lib/providers.js'

const isElectron = () => typeof window !== 'undefined' && !!window.electron

// ── Dropdown menu data ────────────────────────────────────────────────────────
function buildMenus({ onRun, onStop, onSave, onFork, onNewPrompt, isStreaming }) {
    return [
        {
            id: 'file', label: 'File',
            items: [
                { label: 'New prompt', shortcut: '⌘N', action: onNewPrompt },
                { label: 'Save version', shortcut: '⌘S', action: onSave },
                { label: 'Fork version', shortcut: '⌘⇧F', action: onFork },
                { type: 'sep' },
                { label: 'Close window', shortcut: '⌘W', action: () => window.electron?.window.close() },
            ],
        },
        {
            id: 'edit', label: 'Edit',
            items: [
                { label: 'Undo', shortcut: '⌘Z', action: () => document.execCommand('undo') },
                { label: 'Redo', shortcut: '⌘⇧Z', action: () => document.execCommand('redo') },
                { type: 'sep' },
                { label: 'Cut', shortcut: '⌘X', action: () => document.execCommand('cut') },
                { label: 'Copy', shortcut: '⌘C', action: () => document.execCommand('copy') },
                { label: 'Paste', shortcut: '⌘V', action: () => document.execCommand('paste') },
                { label: 'Select all', shortcut: '⌘A', action: () => document.execCommand('selectAll') },
            ],
        },
        {
            id: 'run', label: 'Run',
            items: [
                { label: isStreaming ? 'Stop streaming' : 'Run prompt', shortcut: '⌘↵', action: isStreaming ? onStop : onRun },
                { label: 'Stop streaming', shortcut: '⌘.', action: onStop, disabled: !isStreaming },
            ],
        },
        {
            id: 'view', label: 'View',
            items: [
                { label: 'Toggle DevTools', shortcut: '⌘⌥I', action: () => { if (isElectron()) require('electron').ipcRenderer?.send('devtools') } },
                { type: 'sep' },
                { label: 'Zoom in', shortcut: '⌘+', action: () => { if (isElectron()) window.electron?.window && (document.body.style.zoom = String(parseFloat(document.body.style.zoom || '1') + 0.1)) } },
                { label: 'Zoom out', shortcut: '⌘-', action: () => { if (isElectron()) window.electron?.window && (document.body.style.zoom = String(Math.max(0.5, parseFloat(document.body.style.zoom || '1') - 0.1))) } },
                { label: 'Reset zoom', shortcut: '⌘0', action: () => { document.body.style.zoom = '1' } },
            ],
        },
    ]
}

// ── Dropdown component ────────────────────────────────────────────────────────
function Dropdown({ menu, open, onClose }) {
    const ref = useRef(null)

    useEffect(() => {
        if (!open) return
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open, onClose])

    if (!open) return null

    return (
        <div
            ref={ref}
            style={{
                position: 'absolute', top: '100%', left: 0, zIndex: 1000,
                background: '#1a1a20',
                border: '0.5px solid rgba(255,255,255,0.12)',
                borderRadius: 8, padding: '4px 0',
                minWidth: 200,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
        >
            {menu.items.map((item, i) => {
                if (item.type === 'sep') return (
                    <div key={i} style={{ height: '0.5px', background: 'rgba(255,255,255,0.07)', margin: '3px 0' }} />
                )
                return (
                    <button
                        key={i}
                        disabled={item.disabled}
                        onClick={() => { if (!item.disabled) { item.action?.(); onClose() } }}
                        style={{
                            display: 'flex', alignItems: 'center', width: '100%',
                            padding: '6px 14px', gap: 16, border: 'none', background: 'transparent',
                            color: item.disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)',
                            fontSize: 12, cursor: item.disabled ? 'default' : 'pointer',
                            textAlign: 'left',
                        }}
                        onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = 'rgba(124,108,252,0.15)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.shortcut && (
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
                                {item.shortcut}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

// ── Traffic lights ────────────────────────────────────────────────────────────
function TrafficLights() {
    const inElectron = isElectron()
    const dots = [
        { color: '#EF6C6B', hoverColor: '#ff4444', action: () => window.electron?.window.close(), title: 'Close' },
        { color: '#F5BF4F', hoverColor: '#ffaa00', action: () => window.electron?.window.minimize(), title: 'Minimize' },
        { color: '#62C554', hoverColor: '#00cc44', action: () => window.electron?.window.maximize(), title: 'Maximize' },
    ]

    return (
        <div style={{ display: 'flex', gap: 5, marginRight: 4 }}>
            {dots.map((d, i) => (
                <div
                    key={i}
                    title={d.title}
                    onClick={inElectron ? d.action : undefined}
                    style={{
                        width: 11, height: 11, borderRadius: '50%',
                        background: d.color,
                        cursor: inElectron ? 'pointer' : 'default',
                        transition: 'filter 0.1s',
                    }}
                    onMouseEnter={e => { if (inElectron) e.currentTarget.style.filter = 'brightness(1.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
                />
            ))}
        </div>
    )
}

// ── Main TitleBar ─────────────────────────────────────────────────────────────
export function TitleBar({
    provider, onProviderChange, model, onModelChange,
    apiKey, onApiKeyChange,
    onRun, onStop, isStreaming,
    tokenCount, tokenLimit = 1000,
    onSave, onFork, onNewPrompt,
}) {
    const [openMenu, setOpenMenu] = useState(null)
    const currentProvider = PROVIDERS[provider] || PROVIDERS.anthropic

    const pct = Math.min(100, Math.round((tokenCount / tokenLimit) * 100))
    const tokenColor = pct > 80 ? '#f87171' : pct > 60 ? '#f59e0b' : 'rgba(255,255,255,0.25)'

    function handleProviderChange(e) {
        const p = e.target.value
        onProviderChange(p)
        onModelChange(PROVIDERS[p].models[0].id)
    }

    const menus = buildMenus({ onRun, onStop, onSave, onFork, onNewPrompt, isStreaming })

    const closeMenu = useCallback(() => setOpenMenu(null), [])

    // Close menus on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setOpenMenu(null) }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    return (
        <div style={{ background: '#0f0f12', borderBottom: '0.5px solid rgba(255,255,255,0.06)', flexShrink: 0, userSelect: 'none' }}>

            {/* Row 1 */}
            <div style={{ height: 36, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <TrafficLights />

                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', color: '#e0e0e8' }}>
                    Prompt<span style={{ color: '#7c6cfc' }}>Flow</span>
                </span>

                <div style={{ flex: 1 }} />

                <select value={provider} onChange={handleProviderChange} style={selStyle}>
                    {PROVIDER_IDS.map(id => <option key={id} value={id}>{PROVIDERS[id].label}</option>)}
                </select>

                <div style={dividerStyle} />

                <select value={model} onChange={e => onModelChange(e.target.value)} style={selStyle}>
                    {currentProvider.models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>

                <div style={dividerStyle} />

                <input
                    type="password"
                    value={apiKey}
                    onChange={e => onApiKeyChange(e.target.value)}
                    placeholder={`${currentProvider.label} API key`}
                    style={{
                        width: 170, fontSize: 11,
                        background: 'rgba(255,255,255,0.04)',
                        border: '0.5px solid rgba(255,255,255,0.09)',
                        borderRadius: 6, color: 'rgba(255,255,255,0.45)',
                        padding: '3px 8px', outline: 'none',
                    }}
                />
            </div>

            {/* Row 2 */}
            <div style={{ height: 32, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 2 }}>
                {menus.map(m => (
                    <div key={m.id} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                            style={{
                                fontSize: 11, padding: '3px 11px', borderRadius: 5, border: 'none', cursor: 'pointer',
                                background: openMenu === m.id ? 'rgba(255,255,255,0.07)' : 'transparent',
                                color: openMenu === m.id ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
                                transition: 'all 0.1s',
                            }}
                            onMouseEnter={e => { if (openMenu !== m.id) e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                            onMouseLeave={e => { if (openMenu !== m.id) e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
                        >
                            {m.label}
                        </button>
                        <Dropdown menu={m} open={openMenu === m.id} onClose={closeMenu} />
                    </div>
                ))}

                <div style={{ flex: 1 }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginRight: 10 }}>
                    <div style={{ width: 48, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: tokenColor, borderRadius: 2, transition: 'width 0.3s, background 0.3s' }} />
                    </div>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: tokenColor, minWidth: 52 }}>
                        {tokenCount} / {tokenLimit >= 1000 ? `${tokenLimit / 1000}k` : tokenLimit}
                    </span>
                </div>

                {isStreaming ? (
                    <button onClick={onStop} style={{ ...runStyle, background: 'rgba(248,113,113,0.15)', color: '#f87171', borderColor: 'rgba(248,113,113,0.35)' }}>
                        ■ Stop
                    </button>
                ) : (
                    <button onClick={onRun} style={runStyle}>▶ Run</button>
                )}
            </div>
        </div>
    )
}

const selStyle = {
    fontSize: 11, background: 'transparent', border: 'none',
    color: 'rgba(255,255,255,0.4)', cursor: 'pointer', outline: 'none', padding: '2px 4px',
}
const dividerStyle = { width: '0.5px', height: 12, background: 'rgba(255,255,255,0.08)' }
const runStyle = {
    fontSize: 11, fontWeight: 600, padding: '4px 14px', borderRadius: 5,
    background: 'rgba(124,108,252,0.2)', color: '#9d91fd',
    border: '0.5px solid rgba(124,108,252,0.35)', cursor: 'pointer',
}