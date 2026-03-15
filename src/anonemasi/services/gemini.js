// Gemini API Service with Key Rotation
const getApiKeys = () => {
    const keys = import.meta.env.VITE_GEMINI_API_KEYS;
    if (!keys) return [];
    return keys.split(',').map(k => k.trim()).filter(k => k.length > 0);
};

const MODELS = [
    "gemini-3.1-flash-lite", // 500 RPD limit - best for long sessions
    "gemini-1.5-flash-latest", // Standard stable
    "gemini-1.5-pro-latest", // Quality fallback
    "gemini-2.5-flash",    // Experimental - VERY LOW LIMIT (20 RPD)
    "gemini-1.0-pro",       // Legacy fallback
    "gemini-2.5-flash",
    "gemini-2.5-pro"

];

let _modelIdx = 0;
let _keyIdx = 0;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const callGeminiAPI = async (prompt) => {
    const keys = getApiKeys();
    if (keys.length === 0) {
        throw new Error("No Gemini API keys found. Please add VITE_GEMINI_API_KEYS to your .env file.");
    }

    const totalModels = MODELS.length;
    const totalKeys = keys.length;
    const maxAttempts = totalModels * totalKeys;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const model = MODELS[_modelIdx % totalModels];
        const key = keys[_keyIdx % totalKeys];

        try {
            // Using v1beta for all models as it's often more compatible across keys/regions
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
                    })
                }
            );

            const rawText = await res.text();
            let data;
            try {
                data = JSON.parse(rawText);
            } catch (_) {
                throw new Error(`HTTP ${res.status} — non-JSON response`);
            }

            if (data.error) {
                const errorMsg = data.error.message || "Unknown API Error";
                const errorCode = data.error.code;
                const errorStatus = data.error.status;

                console.error(`[Gemini] API Error ${errorCode} (${errorStatus}): ${errorMsg}`);

                if (errorCode === 403) {
                    _keyIdx++;
                    continue;
                }

                if (errorCode === 404) {
                    _modelIdx++;
                    continue;
                }

                if (errorCode === 429) {
                    if (errorMsg.includes("limit: 0")) {
                        console.error(`[Gemini] Key ${_keyIdx % totalKeys + 1} has 'limit: 0'. This project might not have Gemeni API activated or is restricted.`);
                    } else {
                        console.warn(`[Gemini] Quota exceeded for key ${_keyIdx % totalKeys + 1}. Waiting 3s and rotating key.`);
                        await sleep(3000); // Wait longer for rate limit to reset
                    }
                    _keyIdx++;
                    if (_keyIdx % totalKeys === 0) {
                        _modelIdx++;
                    }
                    continue;
                }

                throw new Error(`API Error: ${errorMsg}`);
            }

            const cand = data.candidates && data.candidates[0];
            if (!cand || !cand.content || !cand.content.parts) {
                if (cand?.finishReason === 'SAFETY') {
                    throw new Error("Response blocked by AI safety filters.");
                }
                throw new Error("Empty response from AI");
            }
            return cand.content.parts[0].text;

        } catch (e) {
            console.warn(`[Gemini] Attempt ${attempt + 1}/${maxAttempts} | ${model} | ${e.message}`);
            _keyIdx++;
            if (_keyIdx % totalKeys === 0) {
                _modelIdx++;
            }
            await sleep(500 + attempt * 200);
        }
    }
    throw new Error("All Gemini API keys and models exhausted or invalid. Please check if your keys are active in Google AI Studio.");
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
