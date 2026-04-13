import React, { useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase.js'

export function WorkspacePanel({
    user, workspaces, activeWorkspaceId, workspaceVersions,
    workspaceLoading, onSelectWorkspace, onCreateWorkspace,
    onInviteMember, onPushVersion, onPullVersion, onSignOut,
    onShowAuth, currentPrompt,
}) {
    const [newWsName, setNewWsName] = useState('')
    const [inviteEmail, setInviteEmail] = useState('')
    const [creating, setCreating] = useState(false)
    const [showInvite, setShowInvite] = useState(false)
    const [pushLabel, setPushLabel] = useState('')

    const configured = isSupabaseConfigured()

    async function handleCreate() {
        if (!newWsName.trim()) return
        setCreating(true)
        await onCreateWorkspace(newWsName.trim())
        setNewWsName('')
        setCreating(false)
    }

    async function handleInvite() {
        if (!inviteEmail.trim()) return
        await onInviteMember(activeWorkspaceId, inviteEmail.trim())
        setInviteEmail('')
        setShowInvite(false)
    }

    async function handlePush() {
        await onPushVersion({ label: pushLabel || 'Shared version', content: currentPrompt })
        setPushLabel('')
    }

    if (!configured) {
        return (
            <div style={panelStyle}>
                <SectionLabel>Team workspace</SectionLabel>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6, padding: '4px 0' }}>
                    Add <code style={{ color: '#f59e0b', fontSize: 10 }}>VITE_SUPABASE_URL</code> and{' '}
                    <code style={{ color: '#f59e0b', fontSize: 10 }}>VITE_SUPABASE_ANON_KEY</code> to your{' '}
                    <code style={{ color: '#f59e0b', fontSize: 10 }}>.env</code> to enable workspaces.
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div style={panelStyle}>
                <SectionLabel>Team workspace</SectionLabel>
                <button onClick={onShowAuth} style={outlineBtnStyle}>
                    Sign in to collaborate
                </button>
            </div>
        )
    }

    return (
        <div style={panelStyle}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <SectionLabel style={{ marginBottom: 0, flex: 1 }}>Workspace</SectionLabel>
                <button onClick={onSignOut} style={ghostBtnStyle} title="Sign out">↩</button>
            </div>

            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
            </div>

            {/* Workspace list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
                {workspaces.map(ws => (
                    <button
                        key={ws.id}
                        onClick={() => onSelectWorkspace(ws.id)}
                        style={{
                            ...wsItemStyle,
                            background: activeWorkspaceId === ws.id ? 'rgba(124,108,252,0.15)' : 'transparent',
                            color: activeWorkspaceId === ws.id ? '#9d91fd' : 'rgba(255,255,255,0.4)',
                        }}
                    >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: activeWorkspaceId === ws.id ? '#7c6cfc' : 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                        {ws.name}
                    </button>
                ))}
            </div>

            {/* Create workspace */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                <input
                    value={newWsName}
                    onChange={e => setNewWsName(e.target.value)}
                    placeholder="New workspace…"
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    style={miniInputStyle}
                />
                <button onClick={handleCreate} disabled={creating || !newWsName.trim()} style={iconBtnStyle}>+</button>
            </div>

            {/* Active workspace actions */}
            {activeWorkspaceId && (
                <>
                    <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />

                    {/* Push current prompt */}
                    <SectionLabel>Push to workspace</SectionLabel>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                        <input
                            value={pushLabel}
                            onChange={e => setPushLabel(e.target.value)}
                            placeholder="Version label…"
                            style={miniInputStyle}
                        />
                        <button onClick={handlePush} style={iconBtnStyle} title="Push">↑</button>
                    </div>

                    {/* Shared versions */}
                    <SectionLabel>Shared versions</SectionLabel>
                    {workspaceLoading ? (
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>Loading…</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 140, overflowY: 'auto' }}>
                            {workspaceVersions.length === 0 && (
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>No shared versions yet</div>
                            )}
                            {workspaceVersions.map(v => (
                                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <button
                                        onClick={() => onPullVersion(v)}
                                        style={{ ...wsItemStyle, flex: 1, color: 'rgba(255,255,255,0.5)' }}
                                        title="Pull into editor"
                                    >
                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
                                            {v.label}
                                        </span>
                                    </button>
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
                                        {v.profiles?.email?.split('@')[0]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Invite */}
                    <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
                    {showInvite ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                            <input
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                placeholder="Email to invite…"
                                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                                style={miniInputStyle}
                            />
                            <button onClick={handleInvite} style={iconBtnStyle}>✓</button>
                        </div>
                    ) : (
                        <button onClick={() => setShowInvite(true)} style={outlineBtnStyle}>
                            + Invite member
                        </button>
                    )}
                </>
            )}
        </div>
    )
}

function SectionLabel({ children }) {
    return (
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 6 }}>
            {children}
        </div>
    )
}

const panelStyle = { padding: '10px 12px' }
const miniInputStyle = {
    flex: 1, fontSize: 11, padding: '3px 6px', borderRadius: 4,
    border: '0.5px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)',
    outline: 'none', minWidth: 0,
}
const iconBtnStyle = {
    width: 24, height: 24, borderRadius: 4, border: '0.5px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer', fontSize: 12, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const wsItemStyle = {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '4px 6px', borderRadius: 4, border: 'none',
    fontSize: 11, cursor: 'pointer', width: '100%',
}
const outlineBtnStyle = {
    width: '100%', fontSize: 11, padding: '4px 0', borderRadius: 5, cursor: 'pointer',
    background: 'transparent', color: 'rgba(255,255,255,0.35)',
    border: '0.5px solid rgba(255,255,255,0.1)',
}
const ghostBtnStyle = {
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)',
    cursor: 'pointer', fontSize: 13, padding: '0 2px',
}