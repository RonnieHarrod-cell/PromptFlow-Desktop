export const INITIAL_PROMPT = `# System Prompt
You are a helpful product assistant for {{product}}.
Be {{tone}} and professional in your responses.
Address the user as {{user_name}}.

# User Message
Hi {{user_name}}, welcome to {{product}}!
{{user_message}}`

export const PROMPT_VERSIONS = [
    {
        id: 'v3',
        label: 'v3 — refine',
        age: 'now',
        content: INITIAL_PROMPT,
        tokens: 347,
    },
    {
        id: 'v2',
        label: 'v2 — concise',
        age: '2h ago',
        content: `# System
You are a concise assistant for {{product}}.
Be {{tone}}.

# User
{{user_name}}: {{user_message}}`,
        tokens: 198,
    },
    {
        id: 'v1',
        label: 'v1 — initial',
        age: '4h ago',
        content: `You are an assistant. Help the user with their questions about {{product}}.
User: {{user_message}}`,
        tokens: 112,
    },
]

export const DEFAULT_VARIABLES = {
    user_name: 'Alex',
    product: 'PromptFlow',
    tone: 'concise',
    user_message: 'Give me a quick summary of your key features.',
}

export const MODELS = [
    'claude-sonnet-4-20250514',
    'claude-opus-4-5',
    'claude-haiku-4-5-20251001',
]

export const AB_PRESETS = {
    creative: { temperature: 0.9, topP: 0.95 },
    balanced: { temperature: 0.7, topP: 0.85 },
    precise: { temperature: 0.2, topP: 0.7 },
}