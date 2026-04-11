import { useState, useCallback } from 'react'
import { PROMPT_VERSIONS } from '../lib/constants.js'

export function useVersionHistory() {
    const [versions, setVersions] = useState(PROMPT_VERSIONS)
    const [activeId, setActiveId] = useState(PROMPT_VERSIONS[0].id)

    const activeVersion = versions.find(v => v.id === activeId) || versions[0]

    const saveVersion = useCallback((content, label) => {
        const id = `v${versions.length + 1}`
        const newVersion = {
            id,
            label: label || `${id} — edit`,
            age: 'now',
            content,
            tokens: Math.ceil(content.length / 4),
        }
        setVersions(prev => [newVersion, ...prev.map(v => ({
            ...v,
            age: v.age === 'now' ? '1m ago' : v.age,
        }))])
        setActiveId(id)
        return id
    }, [versions.length])

    const forkVersion = useCallback((fromId) => {
        const source = versions.find(v => v.id === fromId)
        if (!source) return
        saveVersion(source.content, `fork of ${source.label}`)
    }, [versions, saveVersion])

    const selectVersion = useCallback((id) => {
        setActiveId(id)
    }, [])

    return { versions, activeVersion, activeId, saveVersion, forkVersion, selectVersion }
}