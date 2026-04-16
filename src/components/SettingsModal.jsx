import React from 'react'
import { X } from 'lucide-react'
import { THEMES } from '../lib/themes.js'

const FONT_SIZES = [10, 11, 12, 13, 14, 15, 16]

export function SettingsModal({ onClose, fontSize, onFontSizeChange, themeId, onThemeChange }) {
    return (
        <div
            style={overlay}
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
            <div style={modal}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        Settings
                    </span>
                    <div style={{ flex: 1 }} />
                    <button onClick={onClose} style={closeBtn}>
                        <X size={14} strokeWidth={2} />
                    </button>
                </div>

                {/* Theme picker */}
                <div style={{ marginBottom: 24 }}>
                    <SectionLabel>Theme</SectionLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {Object.values(THEMES).map(theme => (
                            <ThemeSwatch
                                key={theme.id}
                                theme={theme}
                                active={themeId === theme.id}
                                onClick={() => onThemeChange(theme.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Font size picker */}
                <div>
                    <SectionLabel>Editor font size</SectionLabel>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {FONT_SIZES.map(size => (
                            <button
                                key={size}
                                onClick={() => onFontSizeChange(size)}
                                style={{
                                    width: 38, height: 32, borderRadius: 7, cursor: 'pointer',
                                    fontSize: 11, fontWeight: fontSize === size ? 600 : 400,
                                    background: fontSize === size
                                        ? 'rgba(124,108,252,0.18)'
                                        : 'rgba(255,255,255,0.04)',
                                    color: fontSize === size ? '#9d91fd' : 'var(--color-text-secondary)',
                                    border: `0.5px solid ${fontSize === size
                                        ? 'rgba(124,108,252,0.4)'
                                        : 'var(--color-border)'}`,
                                    transition: 'background 0.1s, color 0.1s',
                                }}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function ThemeSwatch({ theme, active, onClick }) {
    const { preview } = theme
    return (
        <button
            onClick={onClick}
            style={{
                padding: 0, cursor: 'pointer',
                borderRadius: 10, overflow: 'hidden',
                border: `1.5px solid ${active ? 'rgba(124,108,252,0.7)' : 'rgba(255,255,255,0.06)'}`,
                outline: active ? '2px solid rgba(124,108,252,0.2)' : 'none',
                outlineOffset: 2,
                background: 'transparent',
                transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
        >
            {/* Mini window preview */}
            <div style={{ background: preview.bg, padding: '8px 8px 6px' }}>
                {/* Traffic lights */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
                    {['#EF6C6B', '#F5BF4F', '#62C554'].map((c, i) => (
                        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />
                    ))}
                </div>
                {/* Mock content */}
                <div style={{ background: preview.bar, borderRadius: 3, padding: '5px 6px', marginBottom: 4 }}>
                    <div style={{ height: 3, width: '55%', background: preview.line1, borderRadius: 2, marginBottom: 3 }} />
                    <div style={{ height: 3, width: '35%', background: preview.line2, borderRadius: 2 }} />
                </div>
                <div style={{ height: 3, width: '80%', background: preview.line1, borderRadius: 2, marginBottom: 3 }} />
                <div style={{ height: 3, width: '50%', background: preview.line2, borderRadius: 2 }} />
            </div>
            {/* Label bar */}
            <div style={{
                background: preview.bar,
                padding: '5px 8px',
                borderTop: `0.5px solid rgba(255,255,255,0.06)`,
            }}>
                <span style={{ fontSize: 10, fontWeight: 500, color: theme.vars['--color-text-secondary'] }}>
                    {theme.label}
                </span>
            </div>
        </button>
    )
}

function SectionLabel({ children }) {
    return (
        <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.07em',
            textTransform: 'uppercase', color: 'var(--color-text-muted)',
            marginBottom: 10,
        }}>
            {children}
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
    width: 390,
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
}

const closeBtn = {
    background: 'none', border: 'none',
    color: 'var(--color-text-muted)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 4, borderRadius: 4,
}
