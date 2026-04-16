import React, { useEffect, useRef } from 'react'
import { Columns2 } from 'lucide-react'

export function PreviewPane({
    userPrompt,
    streamA, streamB,
    tempA, onTempAChange,
    tempB, onTempBChange,
    topP, onTopPChange,
    viewMode, onViewModeChange,
}) {
    const anyStreaming = streamA.isStreaming || streamB.isStreaming
    const activeStream = viewMode === 'b' ? streamB : streamA

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 14px', height: 40, flexShrink: 0,
                borderBottom: '0.5px solid var(--color-border)',
                background: 'var(--color-bg-secondary)',
            }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    Output
                </span>

                {anyStreaming && (
                    <span style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 100,
                        background: 'var(--color-green-dim)', color: 'var(--color-green)',
                    }}>
                        streaming
                    </span>
                )}

                <div style={{ flex: 1 }} />

                {/* View mode toggle */}
                <div style={{
                    display: 'flex', borderRadius: 6, overflow: 'hidden',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                }}>
                    {[
                        { id: 'a', label: 'A' },
                        { id: 'b', label: 'B' },
                        { id: 'compare', label: <Columns2 size={12} strokeWidth={2} /> },
                    ].map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => onViewModeChange(id)}
                            title={id === 'compare' ? 'Compare A & B' : `Slot ${id.toUpperCase()}`}
                            style={{
                                padding: '3px 10px', fontSize: 11, fontWeight: 500,
                                cursor: 'pointer', border: 'none',
                                display: 'flex', alignItems: 'center',
                                background: viewMode === id ? 'rgba(124,108,252,0.15)' : 'transparent',
                                color: viewMode === id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {viewMode !== 'compare' && activeStream.latency && (
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                        {activeStream.latency}ms
                    </span>
                )}
            </div>

            {/* Main output area */}
            {viewMode === 'compare' ? (
                <CompareView
                    userPrompt={userPrompt}
                    streamA={streamA} streamB={streamB}
                    tempA={tempA} tempB={tempB}
                />
            ) : (
                <SingleView
                    userPrompt={userPrompt}
                    stream={activeStream}
                />
            )}

            {/* Parameter controls */}
            <div style={{
                borderTop: '0.5px solid var(--color-border)',
                padding: '10px 16px',
                background: 'var(--color-bg-secondary)',
                flexShrink: 0,
                display: 'flex', flexDirection: 'column', gap: 7,
            }}>
                <Slider label="Temp A" value={tempA} onChange={onTempAChange} color="var(--color-accent)" />
                <Slider label="Temp B" value={tempB} onChange={onTempBChange} color="var(--color-green)" className="green" />
                <Slider label="Top-P"  value={topP}  onChange={onTopPChange}  color="var(--color-blue)"  />
            </div>

            <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
        </div>
    )
}

// ── Single view ───────────────────────────────────────────────────────────────

function SingleView({ userPrompt, stream }) {
    const { output, isStreaming, error } = stream
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [output])

    const isEmpty = !userPrompt && !output && !isStreaming && !error

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: 'var(--color-bg-primary)' }}>
            {isEmpty ? (
                <EmptyState />
            ) : (
                <>
                    {userPrompt && <UserBubble prompt={userPrompt} />}
                    {(output || isStreaming || error) && (
                        <AssistantBubble
                            output={output} isStreaming={isStreaming} error={error}
                            accentColor="var(--color-accent)"
                        />
                    )}
                </>
            )}
            <div ref={bottomRef} />
        </div>
    )
}

// ── Compare view ──────────────────────────────────────────────────────────────

function CompareView({ userPrompt, streamA, streamB, tempA, tempB }) {
    const hasAny = userPrompt || streamA.output || streamB.output || streamA.isStreaming || streamB.isStreaming || streamA.error || streamB.error

    if (!hasAny) {
        return (
            <div style={{ flex: 1, background: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmptyState label="Run to compare A & B" />
            </div>
        )
    }

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-bg-primary)' }}>
            {/* Shared user prompt */}
            {userPrompt && (
                <div style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--color-border)', flexShrink: 0 }}>
                    <UserBubble prompt={userPrompt} />
                </div>
            )}

            {/* Side-by-side columns */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <OutputColumn
                    stream={streamA}
                    label="A"
                    temp={tempA}
                    accentColor="var(--color-accent)"
                    borderRight
                />
                <OutputColumn
                    stream={streamB}
                    label="B"
                    temp={tempB}
                    accentColor="var(--color-green)"
                />
            </div>
        </div>
    )
}

function OutputColumn({ stream, label, temp, accentColor, borderRight }) {
    const { output, isStreaming, error, latency } = stream
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [output])

    return (
        <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
            borderRight: borderRight ? '0.5px solid var(--color-border)' : 'none',
        }}>
            {/* Column header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '6px 14px', flexShrink: 0,
                borderBottom: '0.5px solid var(--color-border)',
                background: 'var(--color-bg-secondary)',
            }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: accentColor }}>
                    {label}
                </span>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    temp {temp.toFixed(2)}
                </span>
                {isStreaming && (
                    <span style={{ fontSize: 10, color: 'var(--color-green)', marginLeft: 2 }}>●</span>
                )}
                {latency && !isStreaming && (
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                        {latency}ms
                    </span>
                )}
            </div>

            {/* Scrollable output */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
                {!output && !isStreaming && !error ? (
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 11, marginTop: 12, textAlign: 'center', opacity: 0.6 }}>
                        waiting…
                    </div>
                ) : (
                    <AssistantBubble
                        output={output} isStreaming={isStreaming} error={error}
                        accentColor={accentColor}
                    />
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function EmptyState({ label = 'Run to see output' }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%',
            color: 'var(--color-text-muted)', gap: 8,
        }}>
            <span style={{ fontSize: 22, opacity: 0.4 }}>⌘↵</span>
            <span style={{ fontSize: 12 }}>{label}</span>
        </div>
    )
}

function UserBubble({ prompt }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <div style={roleLabel}>User</div>
            <div style={{
                ...bubble,
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.07)',
                color: 'var(--color-text-secondary)',
            }}>
                {prompt}
            </div>
        </div>
    )
}

function AssistantBubble({ output, isStreaming, error, accentColor }) {
    if (error) {
        return (
            <>
                <div style={roleLabel}>Assistant</div>
                <div style={{
                    ...bubble,
                    background: 'rgba(248,113,113,0.07)',
                    border: '0.5px solid rgba(248,113,113,0.2)',
                    color: 'var(--color-red)',
                }}>
                    {error}
                </div>
            </>
        )
    }
    return (
        <>
            <div style={roleLabel}>Assistant</div>
            <div style={{
                ...bubble,
                background: accentColor === 'var(--color-green)'
                    ? 'rgba(62,207,142,0.07)'
                    : 'rgba(124,108,252,0.07)',
                border: `0.5px solid ${accentColor === 'var(--color-green)'
                    ? 'rgba(62,207,142,0.15)'
                    : 'rgba(124,108,252,0.15)'}`,
                color: 'var(--color-text-primary)',
            }}>
                {output}
                {isStreaming && (
                    <span style={{
                        display: 'inline-block', width: 2, height: 13,
                        background: accentColor, borderRadius: 1,
                        verticalAlign: 'text-bottom', marginLeft: 2,
                        animation: 'blink 1s step-end infinite',
                    }} />
                )}
            </div>
        </>
    )
}

function Slider({ label, value, onChange, color, className }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', width: 44, flexShrink: 0 }}>
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
            <span style={{ fontSize: 11, fontFamily: 'monospace', color, width: 36, textAlign: 'right', flexShrink: 0 }}>
                {value.toFixed(2)}
            </span>
        </div>
    )
}

const roleLabel = {
    fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
    textTransform: 'uppercase', color: 'var(--color-text-muted)',
    marginBottom: 6,
}

const bubble = {
    padding: '10px 14px', borderRadius: 8,
    fontSize: 12, lineHeight: '1.65', whiteSpace: 'pre-wrap',
}
