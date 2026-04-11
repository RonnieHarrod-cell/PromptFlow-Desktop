import { useState, useRef, useCallback } from 'react'
import { getProvider } from '../lib/providers.js'

/**
 * Provider-agnostic streaming hook.
 * Reads the active provider from the `provider` param and delegates
 * all request-building and SSE-parsing to the provider's own methods.
 */
export function useStreaming() {
    const [output, setOutput] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const [latency, setLatency] = useState(null)
    const [error, setError] = useState(null)
    const abortRef = useRef(null)

    const run = useCallback(async ({
        prompt,
        systemPrompt,
        model,
        temperature,
        topP,
        apiKey,
        provider: providerId = 'anthropic',
    }) => {
        if (abortRef.current) abortRef.current.abort()
        abortRef.current = new AbortController()

        setOutput('')
        setError(null)
        setIsStreaming(true)
        const t0 = performance.now()

        try {
            const provider = getProvider(providerId)
            const messages = [{ role: 'user', content: prompt }]

            const req = provider.buildRequest({
                model,
                messages,
                system: systemPrompt,
                temperature,
                topP,
            })

            // Gemini builds a dynamic URL; all others use a static one
            const url = req.buildUrl ? req.buildUrl(apiKey) : req.url

            const res = await fetch(url, {
                method: 'POST',
                signal: abortRef.current.signal,
                headers: req.headers(apiKey),
                body: JSON.stringify(req.body),
            })

            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                const msg =
                    err?.error?.message ||
                    err?.error?.status ||
                    `HTTP ${res.status}`
                throw new Error(msg)
            }

            setLatency(Math.round(performance.now() - t0))

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let accumulated = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const chunk = decoder.decode(value, { stream: true })

                for (const line of chunk.split('\n')) {
                    if (!line.startsWith('data: ')) continue
                    const data = line.slice(6).trim()
                    if (data === '[DONE]') break
                    try {
                        const parsed = JSON.parse(data)
                        const delta = provider.parseDelta(parsed)
                        if (delta) {
                            accumulated += delta
                            setOutput(accumulated)
                        }
                    } catch (_) { /* skip malformed chunks */ }
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message)
            }
        } finally {
            setIsStreaming(false)
        }
    }, [])

    const stop = useCallback(() => {
        abortRef.current?.abort()
        setIsStreaming(false)
    }, [])

    return { output, isStreaming, latency, error, run, stop }
}