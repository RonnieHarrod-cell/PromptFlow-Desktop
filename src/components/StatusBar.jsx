import React from 'react'

export function StatusBar({ model, latency, lineCount, varCount, isConnected }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '0 12px', height: '22px',
            background: 'var(--color-bg-secondary)',
            borderTop: '0.5px solid var(--color-border)',
            flexShrink: 0,
        }}>
            <StatusItem>
                <span style={{
                    display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%',
                    background: isConnected ? 'var(--color-green)' : 'var(--color-red)',
                    marginRight: '5px',
                }} />
                {isConnected ? 'connected' : 'offline'}
            </StatusItem>

            <StatusItem>model: {model?.replace('claude-', '').replace(/-\d{8}/, '') || '—'}</StatusItem>

            {latency && <StatusItem>latency: {latency}ms</StatusItem>}

            <StatusItem>lines: {lineCount}</StatusItem>
            <StatusItem>vars: {varCount}</StatusItem>
        </div>
    )
}

function StatusItem({ children }) {
    return (
        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
            {children}
        </span>
    )
}