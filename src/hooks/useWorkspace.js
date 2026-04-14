import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'

/**
 * Manages Supabase auth state.
 */
export function useAuth() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isSupabaseConfigured()) { setLoading(false); return }

        supabase.auth.getSession().then(({ data }) => {
            setUser(data?.session?.user ?? null)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signIn = useCallback(async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error }
    }, [])

    const signUp = useCallback(async (email, password) => {
        const { error } = await supabase.auth.signUp({ email, password })
        return { error }
    }, [])

    const signOut = useCallback(async () => {
        await supabase.auth.signOut()
    }, [])

    return { user, loading, signIn, signUp, signOut }
}

/**
 * Workspace CRUD + real-time sync.
 * A workspace groups a set of shared prompt versions accessible to a team.
 */
export function useWorkspace(workspaceId) {
    const [versions, setVersions] = useState([])
    const [workspace, setWorkspace] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Load workspace metadata and versions
    useEffect(() => {
        if (!workspaceId || !isSupabaseConfigured()) return

        setLoading(true)

        Promise.all([
            supabase.from('workspaces').select('*').eq('id', workspaceId).single(),
            supabase.from('prompt_versions')
                .select('*, profiles(email)')
                .eq('workspace_id', workspaceId)
                .order('created_at', { ascending: false }),
        ]).then(([wsResult, versionsResult]) => {
            if (wsResult.error) setError(wsResult.error.message)
            else setWorkspace(wsResult.data)

            if (!versionsResult.error) setVersions(versionsResult.data || [])
            setLoading(false)
        })

        // Real-time subscription for collaborators
        const channel = supabase
            .channel(`workspace:${workspaceId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'prompt_versions',
                filter: `workspace_id=eq.${workspaceId}`,
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setVersions(prev => [payload.new, ...prev])
                } else if (payload.eventType === 'UPDATE') {
                    setVersions(prev => prev.map(v => v.id === payload.new.id ? payload.new : v))
                } else if (payload.eventType === 'DELETE') {
                    setVersions(prev => prev.filter(v => v.id !== payload.old.id))
                }
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [workspaceId])

    // Push a local version to the workspace
    const pushVersion = useCallback(async (version, userId) => {
        if (!isSupabaseConfigured()) return { error: 'Supabase not configured' }

        const { data, error } = await supabase.from('prompt_versions').insert({
            workspace_id: workspaceId,
            user_id: userId,
            label: version.label,
            content: version.content,
            variables: version.variables || {},
        }).select().single()

        return { data, error: error?.message }
    }, [workspaceId])

    // Delete a version
    const deleteVersion = useCallback(async (versionId) => {
        const { error } = await supabase
            .from('prompt_versions')
            .delete()
            .eq('id', versionId)
        return { error: error?.message }
    }, [])

    return { workspace, versions, loading, error, pushVersion, deleteVersion }
}

/**
 * List all workspaces the current user belongs to.
 */
export function useWorkspaceList(userId) {
    const [workspaces, setWorkspaces] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!userId || !isSupabaseConfigured()) return
        setLoading(true)
        supabase
            .from('workspace_members')
            .select('workspace:workspaces(*)')
            .eq('user_id', userId)
            .then(({ data }) => {
                setWorkspaces((data || []).map(r => r.workspace))
                setLoading(false)
            })
    }, [userId])

    const createWorkspace = useCallback(async (name) => {
        if (!isSupabaseConfigured()) return { error: 'Supabase not configured' }

        // Create workspace
        const { data: ws, error: wsErr } = await supabase
            .from('workspaces')
            .insert({ name, owner_id: userId })
            .select().single()

        if (wsErr) return { error: wsErr.message }

        // Add creator as member
        const { error: memberErr } = await supabase
            .from('workspace_members')
            .insert({
                workspace_id: ws.id,
                user_id: userId,
                role: 'owner',
            })

        if (memberErr) return { error: memberErr.message }

        setWorkspaces(prev => [ws, ...prev])
        return { data: ws }
    }, [])

    const inviteMember = useCallback(async (workspaceId, email) => {
        if (!isSupabaseConfigured()) return { error: 'Supabase not configured' }

        // Look up user by email via profiles table
        const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (profileErr) return { error: 'User not found' }

        const { error } = await supabase.from('workspace_members').insert({
            workspace_id: workspaceId,
            user_id: profile.id,
            role: 'member',
        })

        return { error: error?.message }
    }, [])

    return { workspaces, loading, createWorkspace, inviteMember }
}