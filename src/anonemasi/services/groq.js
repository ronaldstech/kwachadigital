const MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it"
];

let _modelIdx = 0;
let _keyIdx = 0;

const getApiKeys = () => {
    const keys = import.meta.env.VITE_GROQ_API_KEYS || "";
    return keys.split(',').map(k => k.trim()).filter(k => k !== "");
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const callGroqAPI = async (prompt) => {
    const keys = getApiKeys();
    if (keys.length === 0) {
        throw new Error("No Groq API keys found. Please add VITE_GROQ_API_KEYS to your .env file.");
    }

    const totalModels = MODELS.length;
    const totalKeys = keys.length;
    const maxAttempts = totalModels * totalKeys;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const model = MODELS[_modelIdx % totalModels];
        const key = keys[_keyIdx % totalKeys];

        try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 4096
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                const errorMsg = errorData.error?.message || `HTTP ${res.status}`;
                console.error(`[Groq] API Error ${res.status}: ${errorMsg}`);

                if (res.status === 401 || res.status === 403) {
                    _keyIdx++;
                    continue;
                }
                if (res.status === 404) {
                    _modelIdx++;
                    continue;
                }
                if (res.status === 429) {
                    console.warn(`[Groq] Quota exceeded for key ${_keyIdx % totalKeys + 1}. Rotating key.`);
                    _keyIdx++;
                    if (_keyIdx % totalKeys === 0) {
                        _modelIdx++;
                    }
                    await sleep(2000);
                    continue;
                }
                throw new Error(`API Error: ${errorMsg}`);
            }

            const data = await res.json();
            const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

            if (!content) {
                throw new Error("Empty response from Groq");
            }

            return content;

        } catch (e) {
            console.warn(`[Groq] Attempt ${attempt + 1}/${maxAttempts} | ${model} | ${e.message}`);
            _keyIdx++;
            if (_keyIdx % totalKeys === 0) {
                _modelIdx++;
            }
            await sleep(500 + attempt * 200);
        }
    }
    throw new Error("All Groq API keys and models exhausted or invalid. Please check your Groq Cloud console.");
};
