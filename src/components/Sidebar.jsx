import React from 'react'

export function Sidebar({ versions, activeId, onSelectVersion, onForkVersion, variables, onVariableChange }) {
    return (
        <div
            style={{
                width: '200px',
                borderRight: '0.5px solid var(--color-border)',
                background: 'var(--color-bg-secondary)',
                display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
            }}
        >
            {/* Versions */}
            <div style={{ padding: '10px 12px 6px' }}>
                <SectionLabel>Versions</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {versions.map(v => (
                        <VersionItem
                            key={v.id}
                            version={v}
                            active={v.id === activeId}
                            onSelect={() => onSelectVersion(v.id)}
                            onFork={() => onForkVersion(v.id)}
                        />
                    ))}
                </div>
            </div>

            <div style={{ height: '0.5px', background: 'var(--color-border)', margin: '4px 0' }} />

            {/* Variables */}
            <div style={{ padding: '8px 12px', flex: 1, overflowY: 'auto' }}>
                <SectionLabel>Variables</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {Object.entries(variables).map(([key, value]) => (
                        <VariableRow
                            key={key}
                            varKey={key}
                            value={value}
                            onChange={val => onVariableChange(key, val)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function SectionLabel({ children }) {
    return (
        <div style={{
            fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em',
            color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px',
        }}>
            {children}
        </div>
    )
}

function VersionItem({ version, active, onSelect, onFork }) {
    return (
        <div
            onClick={onSelect}
            style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 8px', borderRadius: '6px', cursor: 'pointer',
                background: active ? 'var(--color-accent-dim)' : 'transparent',
                transition: 'background 0.1s',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--color-bg-elevated)' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
        >
            <div style={{
                width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                background: active ? 'var(--color-accent)' : 'var(--color-border-strong)',
            }} />
            <span style={{
                fontSize: '11px', fontWeight: 500, flex: 1,
                color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{version.label}</span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', flexShrink: 0 }}>{version.age}</span>
        </div>
    )
}

function VariableRow({ varKey, value, onChange }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{
                fontFamily: 'var(--font-mono, monospace)', fontSize: '10px',
                padding: '2px 5px', borderRadius: '4px',
                background: 'var(--color-amber-dim)', color: 'var(--color-amber)',
                whiteSpace: 'nowrap', flexShrink: 0,
            }}>
                {`{{${varKey}}}`}
            </span>
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    flex: 1, fontSize: '11px', padding: '3px 6px', borderRadius: '4px',
                    border: '0.5px solid var(--color-border-strong)',
                    background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-mono, monospace)', outline: 'none', minWidth: 0,
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border-strong)' }}
            />
        </div>
    )
}