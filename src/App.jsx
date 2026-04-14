import React, { useState, useCallback, useMemo } from 'react'
import { TitleBar } from './components/Titlebar.jsx'
import { Sidebar } from './components/Sidebar.jsx'
import { EditorPane } from './components/EditorPane.jsx'
import { PreviewPane } from './components/PreviewPane.jsx'
import { StatusBar } from './components/StatusBar.jsx'
import { UpdateBanner } from './components/UpdateBanner.jsx'
import { AuthModal } from './components/AuthModal.jsx'
import { useStreaming } from './hooks/useStreaming.js'
import { useVersionHistory } from './hooks/useVersionHistory.js'
import { useApiKey, useMenuActions } from './hooks/useElectron.js'
import { useUpdater } from './hooks/useUpdater.js'
import { useAuth } from './hooks/useWorkspace.js'
import { useWorkspace, useWorkspaceList } from './hooks/useWorkspace.js'
import { injectVariables, estimateTokens } from './lib/utils.js'
import { DEFAULT_VARIABLES } from './lib/constants.js'
import { getProvider } from './lib/providers.js'

export default function App() {
  const [provider, setProvider] = useState('anthropic')
  const [model, setModel] = useState(getProvider('anthropic').models[0].id)
  const [apiKey, setApiKey] = useState('')
  const [variables, setVariables] = useState(DEFAULT_VARIABLES)
  const [isSaved, setIsSaved] = useState(true)
  const [activeSlot, setActiveSlot] = useState('A')
  const [tempA, setTempA] = useState(0.3)
  const [tempB, setTempB] = useState(0.9)
  const [topP, setTopP] = useState(0.85)
  const [showAuth, setShowAuth] = useState(false)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null)

  const { save: saveApiKey } = useApiKey(setApiKey)
  const { versions, activeVersion, activeId, saveVersion, forkVersion, selectVersion } = useVersionHistory()
  const { output, isStreaming, latency, error, run, stop } = useStreaming()
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
    const { system, user: userPrompt } = parsePrompt(injected)
    const temp = activeSlot === 'A' ? tempA : tempB
    run({ prompt: userPrompt, systemPrompt: system, model, temperature: temp, topP, apiKey, provider })
  }, [injected, activeSlot, tempA, tempB, topP, model, apiKey, provider, run])

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
    run: handleRun, stop, save: handleSave, fork: handleFork, 'new-prompt': handleNewPrompt,
  }), [handleRun, stop, handleSave, handleFork, handleNewPrompt]))

  const { user: userPrompt } = parsePrompt(injected)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TitleBar
        provider={provider} onProviderChange={setProvider}
        model={model} onModelChange={setModel}
        apiKey={apiKey} onApiKeyChange={handleApiKeyChange}
        onRun={handleRun} onStop={stop}
        isStreaming={isStreaming}
        tokenCount={tokenCount} tokenLimit={1000}
        onSave={handleSave} onFork={handleFork} onNewPrompt={handleNewPrompt}
      />

      <UpdateBanner
        status={updater.status}
        version={updater.version}
        percent={updater.percent}
        onDownload={updater.download}
        onInstall={updater.install}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
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

        <EditorPane content={promptContent} onChange={handleEditorChange} isSaved={isSaved} />

        <PreviewPane
          userPrompt={userPrompt} output={output}
          isStreaming={isStreaming} error={error} latency={latency}
          tempA={tempA} onTempAChange={setTempA}
          tempB={tempB} onTempBChange={setTempB}
          topP={topP} onTopPChange={setTopP}
          activeSlot={activeSlot} onSlotChange={setActiveSlot}
        />
      </div>

      <StatusBar
        model={model} latency={latency}
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
    </div>
  )
}