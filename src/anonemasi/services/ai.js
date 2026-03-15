import { callGeminiAPI } from './gemini';
import { callClaudeAPI } from './claude';
import { callGroqAPI } from './groq';

/**
 * Unified AI call with Multi-Provider Fallback.
 * Tries providers in order until one succeeds.
 * Order: Groq -> Claude -> Gemini
 */
export const callAI = async (prompt) => {
    // We ignore VITE_AI_PROVIDER for specific order and just try all enabled ones
    // or we can use it to set the starting point. Let's try all in a fixed robust sequence.

    let lastError = null;

    // 1. Try Groq (Fastest / High Limit)
    try {
        console.log("[AI Wrapper] Attempting Groq...");
        return await callGroqAPI(prompt);
    } catch (e) {
        console.warn("[AI Wrapper] Groq failed, trying Claude...", e.message);
        lastError = e;
    }

    // 2. Try Claude (Premium Quality)
    try {
        console.log("[AI Wrapper] Attempting Claude...");
        return await callClaudeAPI(prompt);
    } catch (e) {
        console.warn("[AI Wrapper] Claude failed, trying Gemini...", e.message);
        lastError = e;
    }

    // 3. Try Gemini (Most Keys / Stability)
    try {
        console.log("[AI Wrapper] Attempting Gemini...");
        return await callGeminiAPI(prompt);
    } catch (e) {
        console.error("[AI Wrapper] Gemini failed as well.", e.message);
        lastError = e;
    }

    throw new Error(`All AI providers failed: ${lastError?.message || "Unknown error"}`);
};

export { safeJSON } from './gemini';
