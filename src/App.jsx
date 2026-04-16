import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { TitleBar } from './components/Titlebar.jsx'
import { Sidebar } from './components/Sidebar.jsx'
import { EditorPane } from './components/EditorPane.jsx'
import { PreviewPane } from './components/PreviewPane.jsx'
import { StatusBar } from './components/StatusBar.jsx'
import { UpdateBanner } from './components/UpdateBanner.jsx'
import { AuthModal } from './components/AuthModal.jsx'
import { SettingsModal } from './components/SettingsModal.jsx'
import { CodeExportModal } from './components/CodeExportModal.jsx'
import { useStreaming } from './hooks/useStreaming.js'
import { useVersionHistory } from './hooks/useVersionHistory.js'
import { useApiKey, useMenuActions } from './hooks/useElectron.js'
import { useUpdater } from './hooks/useUpdater.js'
import { useAuth } from './hooks/useWorkspace.js'
import { useWorkspace, useWorkspaceList } from './hooks/useWorkspace.js'
import { injectVariables, estimateTokens } from './lib/utils.js'
import { DEFAULT_VARIABLES } from './lib/constants.js'
import { getProvider } from './lib/providers.js'
import { applyTheme, THEMES, DEFAULT_THEME_ID } from './lib/themes.js'

export default function App() {
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [provider, setProvider] = useState('anthropic')
  const [model, setModel] = useState(getProvider('anthropic').models[0].id)
  const [apiKey, setApiKey] = useState('')
  const [variables, setVariables] = useState(DEFAULT_VARIABLES)
  const [isSaved, setIsSaved] = useState(true)
  const [tempA, setTempA] = useState(0.3)
  const [tempB, setTempB] = useState(0.9)
  const [topP, setTopP] = useState(0.85)
  const [showAuth, setShowAuth] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [viewMode, setViewMode] = useState('a') // 'a' | 'b' | 'compare'
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null)
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('pf_fontSize') || '12'))
  const [themeId, setThemeId] = useState(() => localStorage.getItem('pf_theme') || DEFAULT_THEME_ID)

  useEffect(() => { applyTheme(themeId) }, []) // eslint-disable-line

  const handleThemeChange = useCallback((id) => {
    setThemeId(id)
    localStorage.setItem('pf_theme', id)
    applyTheme(id)
  }, [])

  const handleFontSizeChange = useCallback((size) => {
    setFontSize(size)
    localStorage.setItem('pf_fontSize', String(size))
  }, [])

  const { save: saveApiKey } = useApiKey(setApiKey)
  const { versions, activeVersion, activeId, saveVersion, forkVersion, selectVersion } = useVersionHistory()
  const streamA = useStreaming()
  const streamB = useStreaming()
  const isStreaming = streamA.isStreaming || streamB.isStreaming
  const stopAll = useCallback(() => { streamA.stop(); streamB.stop() }, [streamA, streamB])
  const [promptContent, setPromptContent] = useState(activeVersion.content)

  // Auto-updater
  const updater = useUpdater()

  // Auth + workspaces
  const { user, signIn, signUp, signOut } = useAuth()
  const { workspaces, createWorkspace, inviteMember } = useWorkspaceList(user?.uid)
  const { versions: workspaceVersions, loading: workspaceLoading, pushVersion, deleteVersion } = useWorkspace(activeWorkspaceId)

  const injected = injectVariables(promptContent, variables)
  const tokenCount = estimateTokens(injected)

  function parsePrompt(raw) {
    const systemMatch = raw.match(/^#\s*System.*?\n([\s\S]*?)(?=#\s*User|$)/im)
    const userMatch = raw.match(/^#\s*User.*?\n([\s\S]*?)$/im)
    return {
      system: systemMatch ? systemMatch[1].trim() : '',
      user: userMatch ? userMatch[1].trim() : raw.trim(),
    }
  }

  const handleRun = useCallback(() => {
    const { system, user: userText } = parsePrompt(injected)
    const base = { prompt: userText, systemPrompt: system, model, topP, apiKey, provider }
    if (viewMode === 'compare') {
      streamA.run({ ...base, temperature: tempA })
      streamB.run({ ...base, temperature: tempB })
    } else if (viewMode === 'b') {
      streamB.run({ ...base, temperature: tempB })
    } else {
      streamA.run({ ...base, temperature: tempA })
    }
  }, [injected, viewMode, tempA, tempB, topP, model, apiKey, provider, streamA, streamB])

  const handleSave = useCallback(() => { saveVersion(promptContent); setIsSaved(true) }, [promptContent, saveVersion])
  const handleFork = useCallback(() => forkVersion(activeId), [forkVersion, activeId])
  const handleNewPrompt = useCallback(() => {
    setPromptContent('# System Prompt\nYou are a helpful assistant.\n\n# User Message\n{{user_message}}')
    setIsSaved(false)
  }, [])
  const handleEditorChange = useCallback((value) => { setPromptContent(value || ''); setIsSaved(false) }, [])
  const handleVersionSelect = useCallback((id) => {
    const v = versions.find(v => v.id === id)
    if (v) { selectVersion(id); setPromptContent(v.content); setIsSaved(true) }
  }, [versions, selectVersion])
  const handleVariableChange = useCallback((key, val) => setVariables(prev => ({ ...prev, [key]: val })), [])
  const handleApiKeyChange = useCallback((key) => saveApiKey(key), [saveApiKey])

  // Workspace actions
  const handlePushVersion = useCallback(async ({ label, content }) => {
    if (!user || !activeWorkspaceId) return
    await pushVersion({ label, content, variables }, user.uid)
  }, [user, activeWorkspaceId, pushVersion, variables])

  const handlePullVersion = useCallback((v) => {
    setPromptContent(v.content)
    if (v.variables) setVariables(prev => ({ ...prev, ...v.variables }))
    setIsSaved(false)
  }, [])

  const handleCreateWorkspace = useCallback(async (name) => {
    if (!user) return
    const { data } = await createWorkspace(name, user.uid)
    if (data) setActiveWorkspaceId(data.id)
  }, [user, createWorkspace])

  useMenuActions(useMemo(() => ({
    run: handleRun, stop: stopAll, save: handleSave, fork: handleFork, 'new-prompt': handleNewPrompt,
  }), [handleRun, stopAll, handleSave, handleFork, handleNewPrompt]))

  const { system: systemPrompt, user: userPrompt } = parsePrompt(injected)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TitleBar
        provider={provider} onProviderChange={setProvider}
        model={model} onModelChange={setModel}
        apiKey={apiKey} onApiKeyChange={handleApiKeyChange}
        onRun={handleRun} onStop={stopAll}
        isStreaming={isStreaming}
        tokenCount={tokenCount} tokenLimit={1000}
        onSave={handleSave} onFork={handleFork} onNewPrompt={handleNewPrompt}
        onOpenSettings={() => setShowSettings(true)}
        onOpenExport={() => setShowExport(true)}
      />

      <UpdateBanner
        status={updater.status}
        version={updater.version}
        percent={updater.percent}
        error={updater.error}
        onDownload={updater.download}
        onInstall={updater.install}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          width={sidebarWidth} onWidthChange={setSidebarWidth}
          versions={versions} activeId={activeId}
          onSelectVersion={handleVersionSelect} onForkVersion={forkVersion}
          variables={variables} onVariableChange={handleVariableChange}
          user={user}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          workspaceVersions={workspaceVersions}
          workspaceLoading={workspaceLoading}
          onSelectWorkspace={setActiveWorkspaceId}
          onCreateWorkspace={handleCreateWorkspace}
          onInviteMember={inviteMember}
          onPushVersion={handlePushVersion}
          onPullVersion={handlePullVersion}
          onSignOut={signOut}
          onShowAuth={() => setShowAuth(true)}
          currentPrompt={promptContent}
        />

        <EditorPane
          content={promptContent} onChange={handleEditorChange} isSaved={isSaved}
          variables={variables} fontSize={fontSize}
          monacoTheme={THEMES[themeId]?.monacoTheme ?? 'promptflow-dark'}
        />

        <PreviewPane
          userPrompt={userPrompt}
          streamA={streamA} streamB={streamB}
          tempA={tempA} onTempAChange={setTempA}
          tempB={tempB} onTempBChange={setTempB}
          topP={topP} onTopPChange={setTopP}
          viewMode={viewMode} onViewModeChange={setViewMode}
        />
      </div>

      <StatusBar
        model={model} latency={streamA.latency ?? streamB.latency}
        lineCount={promptContent.split('\n').length}
        varCount={Object.keys(variables).length}
        isConnected={!!apiKey}
      />

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSignIn={signIn}
          onSignUp={signUp}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          themeId={themeId}
          onThemeChange={handleThemeChange}
        />
      )}

      {showExport && (
        <CodeExportModal
          onClose={() => setShowExport(false)}
          provider={provider}
          model={model}
          systemPrompt={systemPrompt}
          userPrompt={userPrompt}
          temperature={viewMode === 'b' ? tempB : tempA}
          topP={topP}
        />
      )}
    </div>
  )
}