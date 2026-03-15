import { useState, useEffect, useCallback } from 'react';
import { callAI, safeJSON } from '../services/ai';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, Timestamp, orderBy, deleteDoc, increment } from 'firebase/firestore';
import { buildWordDoc, triggerDownload } from '../utils/exportUtils';
import { useAuth } from '../../context/AuthContext';

const INITIAL_STATE = {
    id: null,
    userId: null,
    requirements: "",
    topic: "",
    paras: 7,
    refs: 8,
    keyThemes: [],
    essayType: "standard",
    englishStyle: "simple",
    useHeadings: false,
    includeURLs: false,
    specificQs: [],
    sources: [],
    plan: [],
    drafts: {},
    references: "",
    createdAt: null,
    lastModified: null,
};

export const useEssay = () => {
    const { user } = useAuth();
    const [essayState, setEssayState] = useState(INITIAL_STATE);
    const [savedEssays, setSavedEssays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            type: 'essay_welcome',
            content: "Welcome to your Essay Weaver workspace. Upload your assignment brief or paste your requirements below. I'll analyze it thoroughly, find academic sources, build a comprehensive plan, and draft each paragraph with proper citations."
        }
    ]);

    // Update userId when user changes
    useEffect(() => {
        if (user) {
            setEssayState(prev => ({ ...prev, userId: user.uid }));
            fetchSavedEssays(user.uid);
        }
    }, [user]);

    const fetchSavedEssays = async (uid) => {
        try {
            const q = query(
                collection(db, "essays"),
                where("userId", "==", uid),
                orderBy("lastModified", "desc")
            );
            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSavedEssays(docs);
        } catch (error) {
            console.error("Error fetching essays:", error);
        }
    };

    const saveToFirestore = async (state) => {
        if (!state.userId || !state.topic) return state;

        const data = {
            ...state,
            lastModified: Timestamp.now(),
            createdAt: state.createdAt || Timestamp.now()
        };

        try {
            if (state.id) {
                const docRef = doc(db, "essays", state.id);
                await updateDoc(docRef, data);
                return state;
            } else {
                const docRef = await addDoc(collection(db, "essays"), data);
                const newState = { ...state, id: docRef.id };
                setEssayState(newState);
                fetchSavedEssays(state.userId);
                return newState;
            }
        } catch (error) {
            console.error("Error saving to Firestore:", error);
            return state;
        }
    };

    // Auto-save effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (essayState.topic && essayState.userId && !loading) {
                saveToFirestore(essayState);
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [essayState, loading]);

    const loadEssay = async (id) => {
        setLoading(true);
        try {
            const docRef = doc(db, "essays", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setEssayState({ ...data, id: docSnap.id });

                const resumptionMessages = [
                    {
                        role: 'ai',
                        content: `Welcome back! We are currently working on "${data.topic}".`
                    }
                ];

                if (data.references) {
                    resumptionMessages.push({
                        role: 'ai',
                        type: 'essay_complete',
                        content: 'Your essay is fully drafted and ready to export.'
                    });
                } else if (data.drafts && Object.keys(data.drafts).length > 0) {
                    resumptionMessages.push({
                        role: 'ai',
                        type: 'essay_drafting',
                        content: 'Resuming drafting process...'
                    });
                } else if (data.plan && data.plan.length > 0) {
                    resumptionMessages.push({
                        role: 'ai',
                        type: 'essay_plan',
                        plan: data.plan,
                        content: 'Here is the essay plan we generated.'
                    });
                } else if (data.sources && data.sources.length > 0) {
                    resumptionMessages.push({
                        role: 'ai',
                        type: 'essay_sources',
                        sources: data.sources,
                        content: 'Here are the academic sources found for your essay.'
                    });
                }

                setMessages(resumptionMessages);
            }
        } catch (error) {
            console.error("Error loading essay:", error);
        } finally {
            setLoading(false);
        }
    };

    const startNewEssay = () => {
        setEssayState({ ...INITIAL_STATE, userId: user?.uid });
        setMessages([
            {
                role: 'ai',
                type: 'essay_welcome',
                content: "Let's start a new essay. Paste your assignment prompt or specific requirements below."
            }
        ]);
        if (user) fetchSavedEssays(user.uid);
    };

    const deleteEssay = async (id) => {
        try {
            await deleteDoc(doc(db, "essays", id));
            if (essayState.id === id) {
                startNewEssay();
            } else {
                fetchSavedEssays(user.uid);
            }
        } catch (error) {
            console.error("Error deleting essay:", error);
        }
    };

    const addMessage = useCallback((msg) => {
        setMessages(prev => [...prev, msg]);
    }, []);

    // Remove specific loading/thinking messages by ID
    const removeMessage = useCallback((id) => {
        setMessages(prev => prev.filter(msg => msg.id !== id));
    }, []);

    const updateConfig = (newConfig) => {
        setEssayState(prev => ({ ...prev, ...newConfig }));
        saveToFirestore({ ...essayState, ...newConfig });
    };

    const updatePlan = (updatedPlan) => {
        setEssayState(prev => ({ ...prev, plan: updatedPlan }));
        saveToFirestore({ ...essayState, plan: updatedPlan });
    };

    // AI Step 1: Analyze Requirements
    const performAnalysis = async (requirements) => {
        if (!requirements.trim()) return { success: false, message: "Please provide requirements." };

        // Check if user has exceeded their free tier and has no credits
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const essaysGenerated = userData.essaysGenerated || 0;
                    const powerpointsGenerated = userData.powerpointsGenerated || 0;
                    const totalGenerated = essaysGenerated + powerpointsGenerated;
                    const credits = userData.essayCredits || 0;
                    
                    if (totalGenerated >= 1 && credits <= 0) {
                        return { success: false, requirePayment: true };
                    }
                }
            } catch (err) {
                console.error("Error checking quota:", err);
            }
        }

        setLoading(true);
        setEssayState(prev => ({ ...prev, requirements }));

        addMessage({ role: 'user', content: requirements });
        const thinkingId = 'think-analyze-' + Date.now();
        addMessage({ role: 'thinking', id: thinkingId, content: 'Analyzing assignment requirements and identifying key themes...' });

        try {
            const prompt = `Analyze this assignment requirement thoroughly:

"""
${requirements}
"""

Return JSON with:
{
  "topic": "Clear essay title based on the assignment",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "essayType": "One of: analytical, argumentative, expository, descriptive",
  "specificQuestions": ["question1", "question2"]
}

Be thorough and extract ALL key requirements.`;

            const resp = await callAI(prompt);
            const analysis = safeJSON(resp);

            const newState = {
                ...essayState,
                requirements,
                topic: analysis.topic || 'Untitled Essay',
                keyThemes: analysis.keyThemes || [],
                specificQs: analysis.specificQuestions || [],
                essayType: ['analytical', 'argumentative', 'expository'].includes(analysis.essayType?.toLowerCase())
                    ? analysis.essayType.toLowerCase()
                    : 'standard'
            };

            const savedState = await saveToFirestore(newState);
            setEssayState(savedState);

            removeMessage(thinkingId);
            addMessage({
                role: 'ai',
                type: 'essay_analysis',
                analysis: newState,
                content: `Analysis complete. Topic: ${newState.topic}`
            });

            // Update user quotas upon successful analysis start
            if (user) {
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const credits = userSnap.data().essayCredits || 0;
                        await updateDoc(userRef, {
                            essaysGenerated: increment(1),
                            ...(credits > 0 ? { essayCredits: increment(-1) } : {})
                        });
                    }
                } catch (err) {
                    console.error("Error updating user quota:", err);
                }
            }

            return { success: true };
        } catch (error) {
            console.error("Analysis error:", error);
            removeMessage(thinkingId);
            addMessage({ role: 'ai', type: 'error', content: `Analysis failed: ${error.message}` });
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    // AI Step 2: Find Citations
    const findCitations = async () => {
        setLoading(true);
        const thinkingId = 'think-sources-' + Date.now();
        addMessage({ role: 'thinking', id: thinkingId, content: 'Searching for high-quality academic sources...' });

        try {
            const sourcesPrompt = `Find EXACTLY ${essayState.refs} highly relevant academic sources for this essay on: ${essayState.topic}

Key themes to cover:
${essayState.keyThemes.map(t => '- ' + t).join('\n')}

CRITICAL REQUIREMENTS:
- You MUST return EXACTLY ${essayState.refs} sources — no more, no fewer. Count carefully before responding.
- Return ONLY a valid JSON array with exactly ${essayState.refs} items. No markdown, no explanation, no code blocks.

Return exactly this format (${essayState.refs} items):
[
  {
    "author": "Last, F. M.",
    "year": "2023",
    "title": "Full article or book title",
    "type": "journal" or "book" or "report" or "chapter",
    "journal": "Journal Name in Title Case (for journal articles)",
    "volume": "45",
    "issue": "3",
    "pages": "112-134",
    "publisher": "Publisher Name (for books/reports)",
    "relevance": "Brief note on relevance",
    "url": "Direct URL or Google Scholar link"
  }
]

Field rules:
- type: "journal" for journal articles, "book" for monographs, "report" for institutional reports, "chapter" for book chapters
- journal: the real journal name — only for type "journal" or "chapter"
- volume + issue + pages: the REAL volume, issue and page numbers for this specific article — only for type "journal"
- publisher: the real publisher — only for type "book" or "report" or "chapter"
- If you are not certain of a field for a specific source, omit that field entirely rather than guessing
- author: use "Last, F. M." format; for multiple authors separate with " & "
- Sources must be recent (2018-2024), diverse, and highly credible
- Return ONLY the JSON array with EXACTLY ${essayState.refs} items, nothing else`;

            const resp = await callAI(sourcesPrompt);
            let parsedSources = safeJSON(resp, true);

            // If AI returned fewer sources than requested, top up with a second call
            if (parsedSources.length < essayState.refs) {
                const missing = essayState.refs - parsedSources.length;
                const existingTitles = parsedSources.map(s => s.title).join('; ');
                const topUpPrompt = `I need exactly ${missing} MORE academic sources for an essay on: ${essayState.topic}

Do NOT duplicate any of these already-found sources:
${existingTitles}

Return EXACTLY ${missing} new sources as a JSON array with exactly ${missing} items matching the previous schema.
Return ONLY the JSON array, nothing else.`;

                try {
                    const topUpResp = await callAI(topUpPrompt);
                    const extra = safeJSON(topUpResp, true);
                    parsedSources = parsedSources.concat(extra);
                } catch (topUpErr) {
                    console.warn('Top-up sources fetch failed:', topUpErr.message);
                }
            }

            const finalSources = parsedSources.slice(0, essayState.refs);
            const newState = { ...essayState, sources: finalSources };
            const savedState = await saveToFirestore(newState);
            setEssayState(savedState);

            removeMessage(thinkingId);
            addMessage({
                role: 'ai',
                type: 'essay_sources',
                sources: finalSources,
                content: `Found ${finalSources.length} academic sources.`
            });

        } catch (error) {
            console.error("Sources error:", error);
            removeMessage(thinkingId);
            addMessage({ role: 'ai', type: 'error', content: `Source search failed: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    // AI Step 3: Create Plan
    const createPlan = async () => {
        setLoading(true);
        const thinkingId = 'think-plan-' + Date.now();
        addMessage({ role: 'thinking', id: thinkingId, content: 'Building detailed paragraph-by-paragraph plan...' });

        try {
            let essayTypeGuidance = '';
            if (essayState.essayType === 'argumentative') {
                essayTypeGuidance = `CRITICAL ESSAY TYPE GUIDANCE - ARGUMENTATIVE (BODY PARAGRAPHS ONLY):
- Introduction and Conclusion should be written as standard excellent intro/conclusion (NOT argumentative style)
- ONLY body paragraphs should use the argumentative approach
- Compare and contrast different authors' perspectives on the topic
- Present multiple viewpoints from your sources`;
            } else if (essayState.essayType === 'analytical') {
                essayTypeGuidance = `ESSAY TYPE GUIDANCE - ANALYTICAL:
Each body paragraph must:
- Break down complex concepts into components
- Examine causes, effects, and relationships`;
            } else if (essayState.essayType === 'expository') {
                essayTypeGuidance = `ESSAY TYPE GUIDANCE - EXPOSITORY:
Each body paragraph must:
- Explain and inform about the topic objectively
- Present facts and evidence clearly`;
            }

            const planPrompt = `Create a DETAILED paragraph-by-paragraph plan for a ${essayState.paras}-paragraph essay on: ${essayState.topic}

${essayTypeGuidance}

Key themes to cover:
${essayState.keyThemes.map(t => '- ' + t).join('\n')}

Available sources:
${essayState.sources.map((s, i) => `[${i + 1}] ${s.author} (${s.year}): ${s.title}`).join('\n')}

Requirements:
- Total paragraphs: ${essayState.paras} (including 1 introduction + ${essayState.paras - 2} body + 1 conclusion)
- Each body paragraph should cover ALL important aspects of its main point
- For body paragraphs, specify:
  * Main heading (engaging and specific)
  * Detailed purpose (what will be covered and how)
  * Specific sources to cite (by number, referencing the list above)
  * Target word count (intro=100, body=150, conclusion=100)
  * Key points to cover (list ALL major points that should be included)

Return JSON array (${essayState.paras} items):
[
  {
    "section": "Introduction",
    "heading": "Introduction",
    "purpose": "Detailed hook, background, thesis",
    "sources": [],
    "words": 100,
    "keyPoints": ["Hook", "Context", "Thesis"]
  },
  {
    "section": "Body",
    "heading": "Specific descriptive heading",
    "purpose": "Comprehensive description",
    "sources": [1, 3],
    "words": 150,
    "keyPoints": ["Point 1", "Point 2"]
  }
]`;

            const resp = await callAI(planPrompt);
            const plan = safeJSON(resp);

            const newState = { ...essayState, plan };
            const savedState = await saveToFirestore(newState);
            setEssayState(savedState);

            removeMessage(thinkingId);
            addMessage({
                role: 'ai',
                type: 'essay_plan',
                plan,
                content: `Generated a comprehensive plan with ${plan.length} paragraphs.`
            });

        } catch (error) {
            console.error("Plan error:", error);
            removeMessage(thinkingId);
            addMessage({ role: 'ai', type: 'error', content: `Planning failed: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    // Helper for AI Step 4: Single Paragraph Generation
    const draftParagraph = async (planItem, index, onProgress) => {
        const { heading, purpose, words: targetWords, section, sources: sourceIndices } = planItem;
        const isIntro = section === 'Introduction';
        const isConc = section === 'Conclusion';

        let writingStyleInstructions = '';
        if (essayState.essayType === 'argumentative' && !isIntro && !isConc) {
            writingStyleInstructions = `WRITING STYLE - ARGUMENTATIVE: Compare different authors' perspectives implicitly or explicitly. Present multiple viewpoints.`;
        }

        let englishStyleInstructions = '';
        if (essayState.englishStyle === 'simple') {
            englishStyleInstructions = `ENGLISH STYLE - SIMPLE: Write clearly and directly - explain concepts simply. Use straightforward vocabulary. No flowery language.`;
        } else if (essayState.englishStyle === 'common') {
            englishStyleInstructions = `ENGLISH STYLE - STANDARD: Write in normal, professional English. Be direct.`;
        } else {
            englishStyleInstructions = `ENGLISH STYLE - ACADEMIC: Use university-level academic vocabulary. Preserve technical terms.`;
        }

        let sourcesInfo = '';
        if (sourceIndices && sourceIndices.length > 0) {
            sourcesInfo = '\nSources to cite:\n' + sourceIndices.map(idx => {
                const s = essayState.sources[idx - 1];
                return s ? `[${idx}] ${s.author} (${s.year}): ${s.title}` : '';
            }).filter(Boolean).join('\n');
        }

        const draftPrompt = `Write ${isIntro ? 'the introduction' : isConc ? 'the conclusion' : 'a body paragraph'} for this essay: ${essayState.topic}

Heading: ${heading}
Purpose: ${purpose}

CRITICAL STRUCTURE REQUIREMENTS:
1. Write EXACTLY ONE SINGLE PARAGRAPH - do not split.
2. Output ONE continuous flowing paragraph.
${isIntro ? '3. End with a clear thesis statement.' : ''}
${isConc ? '3. Synthesize main arguments and end strong. NO new citations.' : ''}

${writingStyleInstructions}
${englishStyleInstructions}

${(!isIntro && !isConc) ? `CRITICAL CITATION REQUIREMENTS (APA 7th):
- MANDATORY: Every factual claim MUST be cited using the sources provided below.
- FORMAT: (Author, Year) at the end of sentences preferred.
- Only cite sources from the provided list.` : ''}

${sourcesInfo}

WORD COUNT: Write EXACTLY ${targetWords} words (±15%). Count carefully.

Write naturally and engagingly as ONE SINGLE CONTINUOUS PARAGRAPH.`;

        const resp = await callAI(draftPrompt);
        let draft = resp.trim().replace(/\n\n+/g, ' ').replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim();
        return draft;
    };

    // AI Step 4: Draft All Paragraphs Sequentially
    const draftAllParagraphs = async (onParaComplete) => {
        setLoading(true);
        const thinkingId = 'think-drafting-' + Date.now();
        addMessage({ role: 'thinking', id: thinkingId, content: 'Drafting paragraphs organically...' });

        const localDrafts = { ...essayState.drafts };

        try {
            for (let i = 0; i < essayState.plan.length; i++) {
                // Skip already drafted if resuming
                if (localDrafts[i]) continue;

                // Call AI for this paragraph
                const text = await draftParagraph(essayState.plan[i], i);
                localDrafts[i] = text;

                setEssayState(prev => ({ ...prev, drafts: { ...prev.drafts, [i]: text } }));
                if (onParaComplete) {
                    onParaComplete(i, text);
                }
            }

            // Once all paragraphs are drafted, auto-generate references
            await generateReferences(localDrafts, essayState.sources);

        } catch (error) {
            console.error("Drafting error:", error);
            removeMessage(thinkingId);
            addMessage({ role: 'ai', type: 'error', content: `Drafting failed at paragraph: ${error.message}` });
        } finally {
            setLoading(false);
            removeMessage(thinkingId);
        }
    };

    // Helper: Build APA Refs
    const buildAPAReference = (s, includeURLs) => {
        const author = s.author || 'Unknown Author';
        const year = s.year || 'n.d.';
        const title = s.title || 'Untitled';
        const type = (s.type || 'journal').toLowerCase();

        let ref = '';
        if (type === 'book') {
            const pub = s.publisher ? ` ${s.publisher}.` : '';
            ref = `${author} (${year}). <i>${title}</i>.${pub}`;
        } else if (type === 'chapter') {
            const journal = s.journal ? ` <i>${s.journal}</i>` : '';
            const pages = s.pages ? ` (pp. ${s.pages}).` : '.';
            const pub = s.publisher ? ` ${s.publisher}.` : '';
            ref = `${author} (${year}). ${title}. In${journal}${pages}${pub}`;
        } else if (type === 'report') {
            const pub = s.publisher ? ` ${s.publisher}.` : '';
            ref = `${author} (${year}). <i>${title}</i>.${pub}`;
        } else {
            const journal = s.journal || '';
            let citation = '';
            if (journal) {
                const vol = s.volume ? `, ${s.volume}` : '';
                const issue = s.issue ? `(${s.issue})` : '';
                const pages = s.pages ? `, ${s.pages}.` : '.';
                citation = ` <i>${journal}${vol}</i>${issue}${pages}`;
            } else { citation = '.'; }
            ref = `${author} (${year}). ${title}.${citation}`;
        }

        if (includeURLs && s.url && !s.url.includes('scholar.google.com')) {
            ref += ` ${s.url}`;
        }
        return ref;
    };

    // AI Step 5: Generate Final References list
    const generateReferences = async (draftsMap, sourcesList) => {
        try {
            const sorted = [...sourcesList].sort((a, b) => (a.author || '').localeCompare(b.author || ''));
            const refLines = sorted.map(s => buildAPAReference(s, essayState.includeURLs));
            const references = refLines.join('\n');

            const newState = { ...essayState, drafts: draftsMap, references };
            const savedState = await saveToFirestore(newState);
            setEssayState(savedState);

            addMessage({
                role: 'ai',
                type: 'essay_complete',
                content: 'Essay drafting and reference generation is complete!'
            });

        } catch (error) {
            console.error("Reference generation error:", error);
            addMessage({ role: 'ai', type: 'error', content: `References failed: ${error.message}` });
        }
    };

    // Exports
    const exportToWord = () => {
        if (!essayState.references || Object.keys(essayState.drafts).length === 0) return;

        let bodyHtml = '';

        // Add Body
        essayState.plan.forEach((item, i) => {
            const dt = essayState.drafts[i];
            if (dt) {
                if (essayState.useHeadings && item.section === 'Body') {
                    bodyHtml += `<h2>${item.heading}</h2>\n`;
                }
                bodyHtml += `<p>${dt}</p>\n<br/>\n`;
            }
        });

        // Add References on a new page (Word understands page-break-before for headings)
        bodyHtml += `<h2 style="page-break-before: always;">References</h2>\n<p>${essayState.references.replace(/\n/g, '</p><p>')}</p>\n`;

        const docHtml = buildWordDoc(essayState.topic || 'Essay', bodyHtml);
        const safeTitle = (essayState.topic || 'Essay').replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_');
        triggerDownload(docHtml, `${safeTitle}.doc`);
    };

    const exportToPDF = () => {
        if (!essayState.references || Object.keys(essayState.drafts).length === 0) return;

        let bodyHtml = '';

        // Add Body
        essayState.plan.forEach((item, i) => {
            const dt = essayState.drafts[i];
            if (dt) {
                if (essayState.useHeadings && item.section === 'Body') {
                    bodyHtml += `<h2>${item.heading}</h2>\n`;
                }
                bodyHtml += `<p>${dt}</p>\n`;
            }
        });

        // Add References on a new page (PDF print understands page-break-before)
        bodyHtml += `<h2 style="page-break-before: always;">References</h2>\n<p>${essayState.references.replace(/\n/g, '</p><p>')}</p>\n`;

        const safeTitle = (essayState.topic || 'Essay').replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_');

        // Simple PDF export via browser print
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${essayState.topic}</title>
                    <style>
                        body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 2; text-align: justify; }
                        h1 { text-align: center; text-transform: uppercase; margin-bottom: 40px; }
                        h2 { margin-top: 30px; }
                        p { margin-bottom: 15px; }
                        @media print {
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${essayState.topic}</h1>
                    ${bodyHtml}
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return {
        essayState,
        savedEssays,
        messages,
        loading,
        setLoading,
        addMessage,
        loadEssay,
        startNewEssay,
        deleteEssay,
        updateConfig,
        updatePlan,
        performAnalysis,
        findCitations,
        createPlan,
        draftAllParagraphs,
        exportToWord,
        exportToPDF
    };
};
