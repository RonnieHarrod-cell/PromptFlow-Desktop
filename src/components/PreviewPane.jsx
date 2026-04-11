import React, { useEffect, useRef } from 'react'

export function PreviewPane({
    userPrompt,
    output,
    isStreaming,
    error,
    latency,
    tempA, onTempAChange,
    tempB, onTempBChange,
    topP, onTopPChange,
    activeSlot, onSlotChange,
}) {
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [output])

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Pane header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0 12px', height: '32px',
                borderBottom: '0.5px solid var(--color-border)',
                background: 'var(--color-bg-secondary)', flexShrink: 0,
            }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Live preview</span>
                <span style={{
                    fontSize: '10px', padding: '1px 7px', borderRadius: '100px',
                    background: isStreaming ? 'var(--color-green-dim)' : 'var(--color-bg-elevated)',
                    color: isStreaming ? 'var(--color-green)' : 'var(--color-text-muted)',
                }}>
                    {isStreaming ? 'streaming' : output ? 'done' : 'ready'}
                </span>
                <div style={{ flex: 1 }} />
                {/* A / B slot toggle */}
                <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '0.5px solid var(--color-border-strong)' }}>
                    {['A', 'B'].map(slot => (
                        <button
                            key={slot}
                            onClick={() => onSlotChange(slot)}
                            style={{
                                padding: '2px 10px', fontSize: '11px', fontWeight: 500, cursor: 'pointer',
                                background: activeSlot === slot ? 'var(--color-accent-dim)' : 'transparent',
                                color: activeSlot === slot ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                border: 'none',
                            }}
                        >
                            {slot}
                        </button>
                    ))}
                </div>
                {latency && (
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{latency}ms</span>
                )}
            </div>

            {/* Output area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', background: 'var(--color-bg-primary)' }}>
                {userPrompt && (
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '4px' }}>user</div>
                        <div style={{
                            padding: '10px 12px', borderRadius: '12px 12px 12px 3px',
                            background: 'var(--color-bg-elevated)',
                            color: 'var(--color-text-secondary)',
                            fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-wrap',
                        }}>
                            {userPrompt}
                        </div>
                    </div>
                )}

                {(output || isStreaming || error) && (
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '4px' }}>assistant</div>
                        {error ? (
                            <div style={{
                                padding: '10px 12px', borderRadius: '3px 12px 12px 12px',
                                background: 'var(--color-red-dim)', color: 'var(--color-red)',
                                fontSize: '12px', lineHeight: '1.6',
                            }}>
                                Error: {error}
                            </div>
                        ) : (
                            <div style={{
                                padding: '10px 12px', borderRadius: '3px 12px 12px 12px',
                                background: 'var(--color-accent-dim)',
                                color: 'var(--color-text-primary)',
                                fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-wrap',
                            }}>
                                {output}
                                {isStreaming && <span style={{
                                    display: 'inline-block', width: '2px', height: '13px',
                                    background: 'var(--color-accent)', borderRadius: '1px',
                                    verticalAlign: 'text-bottom', marginLeft: '2px',
                                    animation: 'blink 1s step-end infinite',
                                }} />}
                            </div>
                        )}
                    </div>
                )}

                {!userPrompt && !output && !isStreaming && (
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '40px' }}>
                        Press Run to stream a response
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* A/B controls */}
            <div style={{
                borderTop: '0.5px solid var(--color-border)',
                padding: '8px 14px',
                background: 'var(--color-bg-secondary)',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <SliderGroup label="TEMP A" value={tempA} onChange={onTempAChange} color="var(--color-accent)" />
                    <div style={{ width: '0.5px', height: '14px', background: 'var(--color-border-strong)', flexShrink: 0 }} />
                    <SliderGroup label="TEMP B" value={tempB} onChange={onTempBChange} color="var(--color-green)" className="green" />
                </div>
                <SliderGroup label="TOP-P" value={topP} onChange={onTopPChange} color="var(--color-blue)" />
            </div>

            <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
        </div>
    )
}

function SliderGroup({ label, value, onChange, color, className }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flex: 1 }}>
            <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.07em', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {label}
            </span>
            <input
                type="range"
                className={className}
                min="0" max="100"
                value={Math.round(value * 100)}
                onChange={e => onChange(e.target.value / 100)}
                style={{ flex: 1, accentColor: color }}
            />
            <span style={{ fontSize: '11px', fontWeight: 500, color, minWidth: '30px', textAlign: 'right', fontFamily: 'monospace' }}>
                {value.toFixed(2)}
            </span>
        </div>
    )
}