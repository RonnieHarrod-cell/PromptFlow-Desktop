import React, { useState } from 'react'

export function AuthModal({ onClose, onSignIn, onSignUp }) {
    const [mode, setMode] = useState('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit() {
        if (!email || !password) return
        setError(null)
        setLoading(true)

        const { error } = mode === 'signin'
            ? await onSignIn(email, password)
            : await onSignUp(email, password)

        setLoading(false)
        if (error) setError(error.message || String(error))
        else if (mode === 'signup') setSuccess(true)
        else onClose()
    }

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e8', flex: 1 }}>
                        {mode === 'signin' ? 'Sign in to workspaces' : 'Create an account'}
                    </span>
                    <button onClick={onClose} style={closeBtnStyle}>✕</button>
                </div>

                {success ? (
                    <div style={{ color: '#3ecf8e', fontSize: 12, lineHeight: 1.6 }}>
                        Check your email to confirm your account, then sign in.
                    </div>
                ) : (
                    <>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={inputStyle}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ ...inputStyle, marginTop: 8 }}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        />

                        {error && (
                            <div style={{ color: '#f87171', fontSize: 11, marginTop: 8 }}>{error}</div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{ ...primaryBtnStyle, marginTop: 14, opacity: loading ? 0.6 : 1 }}
                        >
                            {loading ? 'Loading…' : mode === 'signin' ? 'Sign in' : 'Create account'}
                        </button>

                        <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                            <button
                                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
                                style={{ background: 'none', border: 'none', color: '#9d91fd', cursor: 'pointer', fontSize: 11 }}
                            >
                                {mode === 'signin' ? 'Sign up' : 'Sign in'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const modalStyle = {
    background: '#28283a',
    border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: 12, padding: '20px 24px',
    width: 340, boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
}
const inputStyle = {
    width: '100%', fontSize: 12, padding: '8px 10px',
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: 6, color: '#e0e0e8', outline: 'none',
    display: 'block',
}
const primaryBtnStyle = {
    width: '100%', fontSize: 12, fontWeight: 600,
    padding: '8px 0', borderRadius: 6, cursor: 'pointer',
    background: 'rgba(124,108,252,0.25)', color: '#9d91fd',
    border: '0.5px solid rgba(124,108,252,0.4)',
}
const closeBtnStyle = {
    background: 'none', border: 'none',
    color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14,
}