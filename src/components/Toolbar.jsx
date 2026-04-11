import React from 'react'
import { formatTokens } from '../lib/utils.js'

export function Toolbar({ onRun, onStop, onSave, isStreaming, tokenCount, tokenLimit = 1000 }) {
    const pct = Math.min(100, Math.round((tokenCount / tokenLimit) * 100))
    const barColor = pct > 80 ? 'var(--color-red)' : pct > 60 ? 'var(--color-amber)' : 'var(--color-accent)'

    return (
        <div
            style={{ background: 'var(--color-bg-primary)', borderBottom: '0.5px solid var(--color-border)' }}
            className="flex items-center gap-2 px-3 h-9 flex-shrink-0"
        >
            {/* Run / Stop */}
            {isStreaming ? (
                <button onClick={onStop} className="tb-btn tb-danger">
                    ■ Stop
                </button>
            ) : (
                <button onClick={onRun} className="tb-btn tb-primary">
                    ▶ Run
                </button>
            )}

            <div className="tb-sep" />

            <button onClick={onSave} className="tb-btn">Save</button>
            <button onClick={() => { }} className="tb-btn">Fork</button>
            <button onClick={() => { }} className="tb-btn">A / B</button>

            <div className="tb-sep" />

            <button onClick={() => { }} className="tb-btn">History</button>

            <div className="flex-1" />

            {/* Token counter */}
            <div
                style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    background: 'var(--color-bg-secondary)',
                    border: '0.5px solid var(--color-border-strong)',
                    borderRadius: '6px', padding: '3px 10px',
                }}
            >
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Tokens</span>
                <div style={{ width: '60px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '2px', transition: 'width 0.3s, background 0.3s' }} />
                </div>
                <span style={{ fontSize: '10px', fontWeight: 500, color: barColor, minWidth: '52px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                    {formatTokens(tokenCount, tokenLimit)}
                </span>
            </div>

            <style>{`
        .tb-btn {
          font-size: 11px; font-weight: 500; padding: 3px 10px;
          border-radius: 6px; border: 0.5px solid var(--color-border-strong);
          background: transparent; color: var(--color-text-secondary);
          cursor: pointer; white-space: nowrap; transition: all 0.1s;
        }
        .tb-btn:hover { background: var(--color-bg-elevated); color: var(--color-text-primary); }
        .tb-primary { background: var(--color-accent-dim) !important; color: var(--color-accent) !important; border-color: var(--color-accent-border) !important; }
        .tb-primary:hover { opacity: 0.8; }
        .tb-danger { background: var(--color-red-dim) !important; color: var(--color-red) !important; border-color: rgba(248,113,113,0.4) !important; }
        .tb-sep { width: 0.5px; height: 14px; background: var(--color-border-strong); margin: 0 2px; }
      `}</style>
        </div>
    )
}