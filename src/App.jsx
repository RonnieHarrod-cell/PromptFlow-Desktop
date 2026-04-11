import React, { useState, useCallback, useMemo } from 'react'
import { TitleBar } from './components/Titlebar.jsx'
import { Sidebar } from './components/Sidebar.jsx'
import { EditorPane } from './components/EditorPane.jsx'
import { PreviewPane } from './components/PreviewPane.jsx'
import { StatusBar } from './components/StatusBar.jsx'
import { useStreaming } from './hooks/useStreaming.js'
import { useVersionHistory } from './hooks/useVersionHistory.js'
import { useApiKey, useMenuActions } from './hooks/useElectron.js'
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

  const { save: saveApiKey } = useApiKey(setApiKey)
  const { versions, activeVersion, activeId, saveVersion, forkVersion, selectVersion } = useVersionHistory()
  const { output, isStreaming, latency, error, run, stop } = useStreaming()
  const [promptContent, setPromptContent] = useState(activeVersion.content)

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
    const { system, user } = parsePrompt(injected)
    const temp = activeSlot === 'A' ? tempA : tempB
    run({ prompt: user, systemPrompt: system, model, temperature: temp, topP, apiKey, provider })
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

  useMenuActions(useMemo(() => ({
    run: handleRun, stop, save: handleSave, fork: handleFork, 'new-prompt': handleNewPrompt,
  }), [handleRun, stop, handleSave, handleFork, handleNewPrompt]))

  const { user: userPreview } = parsePrompt(injected)

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

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          versions={versions} activeId={activeId}
          onSelectVersion={handleVersionSelect} onForkVersion={forkVersion}
          variables={variables} onVariableChange={handleVariableChange}
        />
        <EditorPane content={promptContent} onChange={handleEditorChange} isSaved={isSaved} />
        <PreviewPane
          userPrompt={userPreview} output={output}
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
    </div>
  )
}