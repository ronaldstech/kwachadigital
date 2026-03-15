// Claude API Service with Key Rotation
const getApiKeys = () => {
    const keys = import.meta.env.VITE_CLAUDE_API_KEYS;
    if (!keys) return [];
    return keys.split(',').map(k => k.trim()).filter(k => k.length > 0);
};

const MODELS = [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307"
];

let _modelIdx = 0;
let _keyIdx = 0;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const callClaudeAPI = async (prompt) => {
    const keys = getApiKeys();
    if (keys.length === 0) {
        throw new Error("No Claude API keys found. Please add VITE_CLAUDE_API_KEYS to your .env file.");
    }

    const totalModels = MODELS.length;
    const totalKeys = keys.length;
    const maxAttempts = totalModels * totalKeys;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const model = MODELS[_modelIdx % totalModels];
        const key = keys[_keyIdx % totalKeys];

        try {
            const res = await fetch(
                "/api/anthropic/v1/messages",
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': key,
                        'anthropic-version': '2023-06-01',
                        'anthropic-dangerous-direct-browser-access': 'true'
                    },
                    body: JSON.stringify({
                        model: model,
                        max_tokens: 4096,
                        messages: [{ role: 'user', content: prompt }]
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                const errorMsg = data.error?.message || "Unknown API Error";

                // Rotation logic
                if (res.status === 401 || res.status === 403) {
                    console.error(`[Claude] Key ${_keyIdx % totalKeys + 1} is invalid or revoked: ${errorMsg}`);
                    _keyIdx++;
                    continue;
                }

                if (res.status === 429) {
                    console.warn(`[Claude] Quota exceeded for key ${_keyIdx % totalKeys + 1}. Rotating key.`);
                    _keyIdx++;
                    if (_keyIdx % totalKeys === 0) {
                        _modelIdx++;
                    }
                    continue;
                }

                if (res.status === 404) {
                    console.warn(`[Claude] Model ${model} not found or inaccessible. Rotating model.`);
                    _modelIdx++;
                    continue;
                }

                throw new Error(`API Error: ${errorMsg}`);
            }

            if (!data.content || data.content.length === 0) {
                throw new Error("Empty response from Claude");
            }

            return data.content[0].text;

        } catch (e) {
            console.warn(`[Claude] Attempt ${attempt + 1}/${maxAttempts} | ${model} | ${e.message}`);
            _keyIdx++;
            if (_keyIdx % totalKeys === 0) {
                _modelIdx++;
            }
            await sleep(500 + attempt * 200);
        }
    }
    throw new Error("All Claude API keys and models exhausted or invalid. Please check your .env file and Anthropic dashboard.");
};

export const safeJSON = (raw) => {
    let text = raw.trim();
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        text = jsonMatch[1].trim();
    } else {
        const arrayStart = text.indexOf('[');
        const objStart = text.indexOf('{');

        if (arrayStart !== -1 && (objStart === -1 || arrayStart < objStart)) {
            const arrayEnd = text.lastIndexOf(']');
            if (arrayEnd !== -1) text = text.substring(arrayStart, arrayEnd + 1);
        } else if (objStart !== -1) {
            const objEnd = text.lastIndexOf('}');
            if (objEnd !== -1) text = text.substring(objStart, objEnd + 1);
        }
    }

    try {
        return JSON.parse(text.replace(/,\s*([}\]])/g, '$1'));
    } catch (e) {
        console.error('[safeJSON] Parse failed:', e.message, "\nRaw Text:", text);
        throw new Error('AI response not valid JSON');
    }
};
