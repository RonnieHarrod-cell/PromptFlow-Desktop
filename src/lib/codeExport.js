/**
 * Generates runnable code snippets for each provider + language combination.
 * All string values are JSON-serialised to ensure correct escaping.
 */

const s = JSON.stringify // shorthand for safe string embedding

export function generateCode(lang, { provider, model, systemPrompt, userPrompt, temperature, topP }) {
    const p = { model, system: systemPrompt?.trim() || '', user: userPrompt?.trim() || '', temperature, topP }
    if (lang === 'curl')       return curl(provider, p)
    if (lang === 'python')     return python(provider, p)
    if (lang === 'javascript') return javascript(provider, p)
    return ''
}

// ── cURL ─────────────────────────────────────────────────────────────────────

function curl(provider, { model, system, user, temperature, topP }) {
    if (provider === 'anthropic') {
        const body = JSON.stringify({
            model, max_tokens: 1024,
            ...(system ? { system } : {}),
            messages: [{ role: 'user', content: user }],
            temperature, top_p: topP,
        }, null, 2)
        return `curl https://api.anthropic.com/v1/messages \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '${body}'`
    }

    if (provider === 'openai' || provider === 'groq') {
        const url = provider === 'groq'
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions'
        const messages = [
            ...(system ? [{ role: 'system', content: system }] : []),
            { role: 'user', content: user },
        ]
        const body = JSON.stringify({ model, messages, temperature, top_p: topP }, null, 2)
        return `curl ${url} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '${body}'`
    }

    if (provider === 'gemini') {
        const body = JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: user }] }],
            ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
            generationConfig: { temperature, topP },
        }, null, 2)
        return `curl "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${body}'`
    }

    return '# Provider not supported'
}

// ── Python ───────────────────────────────────────────────────────────────────

function python(provider, { model, system, user, temperature, topP }) {
    if (provider === 'anthropic') {
        return `import anthropic

client = anthropic.Anthropic(api_key="YOUR_API_KEY")

response = client.messages.create(
    model=${s(model)},
    max_tokens=1024,${system ? `\n    system=${s(system)},` : ''}
    messages=[{"role": "user", "content": ${s(user)}}],
    temperature=${temperature},
    top_p=${topP},
)

print(response.content[0].text)`
    }

    if (provider === 'openai' || provider === 'groq') {
        const baseUrl = provider === 'groq'
            ? '\n    base_url="https://api.groq.com/openai/v1",'
            : ''
        const msgs = [
            ...(system ? [`    {"role": "system", "content": ${s(system)}}`] : []),
            `    {"role": "user", "content": ${s(user)}}`,
        ].join(',\n')
        return `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",${baseUrl}
)

response = client.chat.completions.create(
    model=${s(model)},
    messages=[
${msgs},
    ],
    temperature=${temperature},
    top_p=${topP},
)

print(response.choices[0].message.content)`
    }

    if (provider === 'gemini') {
        return `import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")

model = genai.GenerativeModel(
    ${s(model)},${system ? `\n    system_instruction=${s(system)},` : ''}
)

response = model.generate_content(
    ${s(user)},
    generation_config=genai.types.GenerationConfig(
        temperature=${temperature},
        top_p=${topP},
    ),
)

print(response.text)`
    }

    return '# Provider not supported'
}

// ── JavaScript ───────────────────────────────────────────────────────────────

function javascript(provider, { model, system, user, temperature, topP }) {
    if (provider === 'anthropic') {
        return `import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: 'YOUR_API_KEY' })

const response = await client.messages.create({
  model: ${s(model)},
  maxTokens: 1024,${system ? `\n  system: ${s(system)},` : ''}
  messages: [{ role: 'user', content: ${s(user)} }],
  temperature: ${temperature},
  topP: ${topP},
})

console.log(response.content[0].text)`
    }

    if (provider === 'openai' || provider === 'groq') {
        const baseUrl = provider === 'groq'
            ? "\n  baseURL: 'https://api.groq.com/openai/v1',"
            : ''
        const msgs = [
            ...(system ? [`    { role: 'system', content: ${s(system)} }`] : []),
            `    { role: 'user', content: ${s(user)} }`,
        ].join(',\n')
        return `import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: 'YOUR_API_KEY',${baseUrl}
})

const response = await client.chat.completions.create({
  model: ${s(model)},
  messages: [
${msgs},
  ],
  temperature: ${temperature},
  topP: ${topP},
})

console.log(response.choices[0].message.content)`
    }

    if (provider === 'gemini') {
        return `import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI('YOUR_API_KEY')

const model = genAI.getGenerativeModel({
  model: ${s(model)},${system ? `\n  systemInstruction: ${s(system)},` : ''}
})

const result = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: ${s(user)} }] }],
  generationConfig: { temperature: ${temperature}, topP: ${topP} },
})

console.log(result.response.text())`
    }

    return '// Provider not supported'
}

// ── Install hints ─────────────────────────────────────────────────────────────

export const INSTALL_HINTS = {
    anthropic: { python: 'pip install anthropic', javascript: 'npm install @anthropic-ai/sdk' },
    openai:    { python: 'pip install openai',    javascript: 'npm install openai' },
    groq:      { python: 'pip install openai',    javascript: 'npm install openai' },
    gemini:    { python: 'pip install google-generativeai', javascript: 'npm install @google/generative-ai' },
}
