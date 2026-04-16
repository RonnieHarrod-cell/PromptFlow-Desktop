import React, { useCallback, useState } from 'react'
import { History, Braces, Users } from 'lucide-react'
import { WorkspacePanel } from './WorkspacePanel.jsx'

const MIN_WIDTH = 180
const MAX_WIDTH = 440

const TABS = [
    { id: 'versions', Icon: History, label: 'Versions' },
    { id: 'variables', Icon: Braces, label: 'Variables' },
    { id: 'workspace', Icon: Users, label: 'Workspace' },
]

export function Sidebar({
    width = 200, onWidthChange,
    versions, activeId, onSelectVersion, onForkVersion,
    variables, onVariableChange,
    user, workspaces, activeWorkspaceId, workspaceVersions, workspaceLoading,
    onSelectWorkspace, onCreateWorkspace, onInviteMember,
    onPushVersion, onPullVersion, onSignOut, onShowAuth,
    currentPrompt,
}) {
    const [tab, setTab] = useState('versions')

    const handleDragStart = useCallback((e) => {
        e.preventDefault()
        const startX = e.clientX
        const startWidth = width
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
        const onMove = (e) => {
            onWidthChange(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + e.clientX - startX)))
        }
        const onUp = () => {
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
        }
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }, [width, onWidthChange])

    return (
        <div style={{
            width, flexShrink: 0, display: 'flex', flexDirection: 'column',
            background: 'var(--color-bg-primary)',
            borderRight: '0.5px solid var(--color-border)',
            overflow: 'hidden', position: 'relative',
        }}>
            {/* Icon tab bar */}
            <div style={{
                display: 'flex', height: 40, flexShrink: 0,
                borderBottom: '0.5px solid var(--color-border)',
            }}>
                {TABS.map(({ id, Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        title={label}
                        style={{
                            flex: 1, border: 'none', background: 'transparent',
                            cursor: 'pointer', position: 'relative',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: tab === id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => { if (tab !== id) e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                        onMouseLeave={e => { if (tab !== id) e.currentTarget.style.color = 'var(--color-text-muted)' }}
                    >
                        <Icon size={15} strokeWidth={1.75} />
                        {tab === id && (
                            <span style={{
                                position: 'absolute', bottom: 0,
                                left: '20%', right: '20%',
                                height: 2, borderRadius: 1,
                                background: 'var(--color-accent)',
                            }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Section content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {tab === 'versions' && (
                    <VersionsSection
                        versions={versions} activeId={activeId}
                        onSelectVersion={onSelectVersion} onForkVersion={onForkVersion}
                    />
                )}
                {tab === 'variables' && (
                    <VariablesSection variables={variables} onVariableChange={onVariableChange} />
                )}
                {tab === 'workspace' && (
                    <WorkspacePanel
                        user={user} workspaces={workspaces}
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
                )}
            </div>

            {/* Resize handle */}
            <div
                onMouseDown={handleDragStart}
                style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0,
                    width: 4, cursor: 'col-resize', zIndex: 10,
                }}
            />
        </div>
    )
}

function SectionHeader({ children }) {
    return (
        <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.07em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
            marginBottom: 10,
        }}>
            {children}
        </div>
    )
}

function VersionsSection({ versions, activeId, onSelectVersion, onForkVersion }) {
    return (
        <div style={{ padding: '14px 12px' }}>
            <SectionHeader>Versions</SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {versions.map(v => (
                    <VersionRow
                        key={v.id} version={v}
                        active={v.id === activeId}
                        onSelect={() => onSelectVersion(v.id)}
                        onFork={() => onForkVersion(v.id)}
                    />
                ))}
            </div>
        </div>
    )
}

function VersionRow({ version, active, onSelect }) {
    return (
        <div
            onClick={onSelect}
            style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
                background: active ? 'rgba(124,108,252,0.12)' : 'transparent',
                border: `0.5px solid ${active ? 'rgba(124,108,252,0.2)' : 'transparent'}`,
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
        >
            <div style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: active ? 'var(--color-accent)' : 'rgba(255,255,255,0.15)',
            }} />
            <span style={{
                flex: 1, fontSize: 12,
                color: active ? '#9d91fd' : 'rgba(255,255,255,0.45)',
                fontWeight: active ? 500 : 400,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
                {version.label}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
                {version.age}
            </span>
        </div>
    )
}

function VariablesSection({ variables, onVariableChange }) {
    return (
        <div style={{ padding: '14px 12px' }}>
            <SectionHeader>Variables</SectionHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(variables).map(([key, value]) => (
                    <VariableRow key={key} varKey={key} value={value} onChange={val => onVariableChange(key, val)} />
                ))}
            </div>
        </div>
    )
}

function VariableRow({ varKey, value, onChange }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{
                alignSelf: 'flex-start', fontSize: 10, fontFamily: 'monospace',
                padding: '2px 6px', borderRadius: 4,
                background: 'rgba(245,158,11,0.1)', color: 'var(--color-amber)',
            }}>
                {`{{${varKey}}}`}
            </span>
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    fontSize: 11, padding: '5px 8px', borderRadius: 6,
                    border: '0.5px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'rgba(255,255,255,0.6)',
                    fontFamily: 'inherit', outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(124,108,252,0.4)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
            />
        </div>
    )
}
