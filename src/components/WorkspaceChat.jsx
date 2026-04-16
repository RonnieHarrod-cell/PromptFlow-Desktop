import React, { useState, useEffect, useRef } from 'react'
import { useWorkspaceChat } from '../hooks/useWorkspace.js'

export function WorkspaceChat({ workspaceId, user }) {
    const { messages, sendMessage } = useWorkspaceChat(workspaceId)
    const [text, setText] = useState('')
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function handleSend() {
        if (!text.trim()) return
        await sendMessage(text.trim(), user.uid, user.email)
        setText('')
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Message list */}
            <div style={{
                height: 200, overflowY: 'auto', display: 'flex',
                flexDirection: 'column', gap: 1,
                paddingBottom: 4,
            }}>
                {messages.length === 0 && (
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 32 }}>
                        No messages yet
                    </div>
                )}
                {messages.map(msg => (
                    <ChatMessage
                        key={msg.id}
                        msg={msg}
                        isOwn={msg.senderId === user.uid}
                    />
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 4, paddingTop: 6, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="Message…"
                    style={{
                        flex: 1, fontSize: 11, padding: '4px 7px', borderRadius: 4,
                        border: '0.5px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)',
                        outline: 'none', minWidth: 0,
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(124,108,252,0.5)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                />
                <button
                    onClick={handleSend}
                    disabled={!text.trim()}
                    style={{
                        width: 24, height: 24, borderRadius: 4, flexShrink: 0,
                        border: '0.5px solid rgba(255,255,255,0.1)',
                        background: text.trim() ? 'rgba(124,108,252,0.2)' : 'rgba(255,255,255,0.05)',
                        color: text.trim() ? '#9d91fd' : 'rgba(255,255,255,0.25)',
                        cursor: text.trim() ? 'pointer' : 'default',
                        fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >↑</button>
            </div>
        </div>
    )
}

function ChatMessage({ msg, isOwn }) {
    const name = msg.senderEmail?.split('@')[0] ?? '?'
    const time = formatTime(msg.createdAt)

    return (
        <div style={{
            padding: '4px 6px', borderRadius: 5,
            background: isOwn ? 'rgba(124,108,252,0.08)' : 'transparent',
        }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 2 }}>
                <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: isOwn ? '#9d91fd' : 'rgba(255,255,255,0.4)',
                }}>
                    {name}
                </span>
                {time && (
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)' }}>
                        {time}
                    </span>
                )}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45, wordBreak: 'break-word' }}>
                {msg.text}
            </div>
        </div>
    )
}

function formatTime(ts) {
    if (!ts) return ''
    try {
        const d = ts.toDate ? ts.toDate() : new Date(ts)
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
        return ''
    }
}
