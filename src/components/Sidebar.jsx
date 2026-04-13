import React from 'react'
import { WorkspacePanel } from './WorkspacePanel.jsx'

export function Sidebar({
    versions, activeId, onSelectVersion, onForkVersion,
    variables, onVariableChange,
    // workspace props
    user, workspaces, activeWorkspaceId, workspaceVersions, workspaceLoading,
    onSelectWorkspace, onCreateWorkspace, onInviteMember,
    onPushVersion, onPullVersion, onSignOut, onShowAuth,
    currentPrompt,
}) {
    return (
        <div style={{
            width: 200, borderRight: '0.5px solid rgba(255,255,255,0.06)',
            background: '#0f0f12', display: 'flex', flexDirection: 'column',
            flexShrink: 0, overflow: 'hidden',
        }}>
            {/* Versions */}
            <div style={{ padding: '10px 12px 6px' }}>
                <SectionLabel>Versions</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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

            <Divider />

            {/* Variables */}
            <div style={{ padding: '8px 12px', overflowY: 'auto' }}>
                <SectionLabel>Variables</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {Object.entries(variables).map(([key, value]) => (
                        <VariableRow key={key} varKey={key} value={value} onChange={val => onVariableChange(key, val)} />
                    ))}
                </div>
            </div>

            <Divider />

            {/* Workspace */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
                <WorkspacePanel
                    user={user}
                    workspaces={workspaces}
                    activeWorkspaceId={activeWorkspaceId}
                    workspaceVersions={workspaceVersions}
                    workspaceLoading={workspaceLoading}
                    onSelectWorkspace={onSelectWorkspace}
                    onCreateWorkspace={onCreateWorkspace}
                    onInviteMember={onInviteMember}
                    onPushVersion={onPushVersion}
                    onPullVersion={onPullVersion}
                    onSignOut={onSignOut}
                    onShowAuth={onShowAuth}
                    currentPrompt={currentPrompt}
                />
            </div>
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

function Divider() {
    return <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
}

function VersionItem({ version, active, onSelect, onFork }) {
    return (
        <div
            onClick={onSelect}
            style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 8px', borderRadius: 6, cursor: 'pointer',
                background: active ? 'rgba(124,108,252,0.15)' : 'transparent',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
        >
            <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: active ? '#7c6cfc' : 'rgba(255,255,255,0.15)' }} />
            <span style={{ fontSize: 11, fontWeight: 500, flex: 1, color: active ? '#9d91fd' : 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {version.label}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{version.age}</span>
        </div>
    )
}

function VariableRow({ varKey, value, onChange }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 5px', borderRadius: 4, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {`{{${varKey}}}`}
            </span>
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    flex: 1, fontSize: 11, padding: '3px 6px', borderRadius: 4,
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)',
                    fontFamily: 'monospace', outline: 'none', minWidth: 0,
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(124,108,252,0.5)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
        </div>
    )
}