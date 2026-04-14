import { useState, useEffect, useCallback } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  collection, doc, addDoc, setDoc, getDocs, getDoc,
  onSnapshot, query, where, orderBy,
  serverTimestamp, deleteDoc, updateDoc,
} from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../lib/firebase.js'

// ── Auth ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured()) { setLoading(false); return }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const signIn = useCallback(async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { error: null }
    } catch (e) {
      return { error: e }
    }
  }, [])

  const signUp = useCallback(async (email, password) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      // Write email to users collection so invite-by-email lookup works
      await setDoc(doc(db, 'users', user.uid), { email })
      return { error: null }
    } catch (e) {
      return { error: e }
    }
  }, [])

  const signOut = useCallback(() => fbSignOut(auth), [])

  return { user, loading, signIn, signUp, signOut }
}

// ── Workspace list ────────────────────────────────────────────────────────────
export function useWorkspaceList(userId) {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    if (!userId || !isFirebaseConfigured()) return
    setLoading(true)

    // Listen to workspaces where user is a member
    const q = query(
      collection(db, 'workspaces'),
      where('members', 'array-contains', userId)
    )

    const unsub = onSnapshot(q, (snap) => {
      setWorkspaces(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })

    return unsub
  }, [userId])

  const createWorkspace = useCallback(async (name, userId) => {
    if (!isFirebaseConfigured()) return { error: 'Firebase not configured' }
    try {
      const ref = await addDoc(collection(db, 'workspaces'), {
        name,
        ownerId: userId,
        members: [userId],
        createdAt: serverTimestamp(),
      })
      return { data: { id: ref.id, name } }
    } catch (e) {
      return { error: e.message }
    }
  }, [])

  const inviteMember = useCallback(async (workspaceId, email) => {
    if (!isFirebaseConfigured()) return { error: 'Firebase not configured' }
    try {
      // Look up user by email in our users collection
      const q = query(collection(db, 'users'), where('email', '==', email))
      const snap = await getDocs(q)
      if (snap.empty) return { error: 'No user found with that email. They must sign up first.' }

      const invitedUserId = snap.docs[0].id
      const wsRef = doc(db, 'workspaces', workspaceId)
      const wsSnap = await getDoc(wsRef)
      if (!wsSnap.exists()) return { error: 'Workspace not found' }

      const members = wsSnap.data().members || []
      if (members.includes(invitedUserId)) return { error: 'Already a member' }

      await updateDoc(wsRef, { members: [...members, invitedUserId] })
      return { error: null }
    } catch (e) {
      return { error: e.message }
    }
  }, [])

  return { workspaces, loading, createWorkspace, inviteMember }
}

// ── Workspace versions (real-time) ────────────────────────────────────────────
export function useWorkspace(workspaceId) {
  const [versions, setVersions] = useState([])
  const [workspace, setWorkspace] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!workspaceId || !isFirebaseConfigured()) return
    setLoading(true)

    // Workspace metadata
    const wsUnsub = onSnapshot(doc(db, 'workspaces', workspaceId), (snap) => {
      if (snap.exists()) setWorkspace({ id: snap.id, ...snap.data() })
    })

    // Shared versions — real-time
    const q = query(
      collection(db, 'workspaces', workspaceId, 'versions'),
      orderBy('createdAt', 'desc')
    )

    const versionsUnsub = onSnapshot(q, (snap) => {
      setVersions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => {
      setError(err.message)
      setLoading(false)
    })

    return () => { wsUnsub(); versionsUnsub() }
  }, [workspaceId])

  const pushVersion = useCallback(async ({ label, content, variables }, userId) => {
    if (!isFirebaseConfigured() || !workspaceId) return { error: 'Not configured' }
    try {
      await addDoc(collection(db, 'workspaces', workspaceId, 'versions'), {
        label,
        content,
        variables: variables || {},
        userId,
        createdAt: serverTimestamp(),
      })
      return { error: null }
    } catch (e) {
      return { error: e.message }
    }
  }, [workspaceId])

  const deleteVersion = useCallback(async (versionId) => {
    if (!workspaceId) return
    try {
      await deleteDoc(doc(db, 'workspaces', workspaceId, 'versions', versionId))
    } catch (e) {
      console.error('Delete failed:', e.message)
    }
  }, [workspaceId])

  return { workspace, versions, loading, error, pushVersion, deleteVersion }
}