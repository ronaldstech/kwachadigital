import { useState, useCallback, useEffect } from 'react';
import { callAI, safeJSON } from '../services/ai';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { buildWordDoc, triggerDownload } from '../utils/exportUtils';
import { useAuth } from '../../context/AuthContext';

const CHAPTER_CONFIGS = {
    1: {
        sections: [
            { heading: "Background of the Study", description: "Contextualizes the research problem within the broader field", defaultWords: 400 },
            { heading: "Statement of the Problem", description: "Clearly articulates the specific research problem being addressed", defaultWords: 300 },
            { heading: "Objectives of the Study", description: "Lists general and specific objectives of the research", defaultWords: 200 },
            { heading: "Research Questions", description: "Poses the key questions the study seeks to answer", defaultWords: 150 },
            { heading: "Significance of the Study", description: "Explains why the research matters and who benefits", defaultWords: 250 },
            { heading: "Scope and Limitations", description: "Defines the boundaries and limitations of the study", defaultWords: 200 },
            { heading: "Definition of Terms", description: "Clarifies key terms and concepts used in the study", defaultWords: 150 },
        ]
    },
    2: {
        sections: [
            { heading: "Introduction", description: "Overview of the literature review chapter", defaultWords: 150 },
            { heading: "Theoretical Framework", description: "Presents the theories underpinning the study", defaultWords: 350 },
            { heading: "Conceptual Framework", description: "Illustrates concepts and their relationships", defaultWords: 300 },
            { heading: "Empirical Literature Review", description: "Synthesizes prior empirical studies on the topic", defaultWords: 500 },
            { heading: "Research Gaps", description: "Identifies gaps the current study addresses", defaultWords: 200 },
            { heading: "Summary", description: "Summarizes the key themes from the literature", defaultWords: 150 },
        ]
    },
    3: {
        sections: [
            { heading: "Introduction", description: "Overview of the methodology chapter", defaultWords: 100 },
            { heading: "Research Design", description: "Describes the overall research design and approach", defaultWords: 250 },
            { heading: "Study Area", description: "Describes the geographic or organizational setting", defaultWords: 200 },
            { heading: "Target Population", description: "Defines the population of interest", defaultWords: 150 },
            { heading: "Sampling Technique and Sample Size", description: "Explains how the sample was selected and its size", defaultWords: 250 },
            { heading: "Data Collection Methods", description: "Describes tools and procedures for data collection", defaultWords: 300 },
            { heading: "Data Analysis", description: "Explains how data will be analyzed", defaultWords: 200 },
            { heading: "Ethical Considerations", description: "Addresses ethical issues relevant to the study", defaultWords: 150 },
        ]
    },
    4: {
        sections: [
            { heading: "Introduction", description: "Brief overview of findings chapter structure", defaultWords: 100 },
            { heading: "Demographic Profile of Respondents", description: "Presents background characteristics of participants", defaultWords: 250 },
            { heading: "Findings on Objective One", description: "Presents data addressing the first objective", defaultWords: 400 },
            { heading: "Findings on Objective Two", description: "Presents data addressing the second objective", defaultWords: 400 },
            { heading: "Findings on Objective Three", description: "Presents data addressing the third objective", defaultWords: 400 },
            { heading: "Discussion of Findings", description: "Interprets and relates findings to prior literature", defaultWords: 400 },
        ]
    },
    5: {
        sections: [
            { heading: "Introduction", description: "Brief overview of the conclusions chapter", defaultWords: 100 },
            { heading: "Summary of Findings", description: "Concisely summarizes the key findings", defaultWords: 300 },
            { heading: "Conclusions", description: "Draws conclusions linked to research objectives", defaultWords: 300 },
            { heading: "Recommendations", description: "Provides actionable recommendations based on findings", defaultWords: 300 },
            { heading: "Areas for Further Research", description: "Suggests topics for future studies", defaultWords: 150 },
        ]
    }
};

const INITIAL_STATE = {
    id: null,
    userId: null,
    topic: "",
    program: "",
    region: "",
    selectedTopicData: null,
    hasConceptNote: false,
    conceptNote: "",
    currentChapter: 0,
    chapters: {
        1: { title: "Chapter 1: Study Overview", content: "", plan: null, approved: false, drafts: {} },
        2: { title: "Chapter 2: Literature Review", content: "", plan: null, approved: false, drafts: {} },
        3: { title: "Chapter 3: Research Methodology", content: "", plan: null, expanded: false, approved: false, drafts: {} },
        4: { title: "Chapter 4: Findings", content: "", plan: null, approved: false, drafts: {} },
        5: { title: "Chapter 5: Conclusions & Recommendations", content: "", plan: null, approved: false, drafts: {} }
    },
    researchData: "",
    references: "",
    chapterCitations: {},
    approvedCitations: {},
    includeDoi: false,
    completed: false,
    plan: 'free', // New: Track plan per dissertation
    createdAt: null,
    lastModified: null
};

export const useDissertation = () => {
    const { user } = useAuth();
    const [dissState, setDissState] = useState(INITIAL_STATE);
    const [savedDissertations, setSavedDissertations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            type: 'welcome',
            content: "Welcome to your dissertation workspace. I'm here to help you write a high-quality academic dissertation chapter by chapter."
        }
    ]);

    // Update userId when user changes
    useEffect(() => {
        if (user) {
            setDissState(prev => ({ ...prev, userId: user.uid }));
            fetchSavedDissertations(user.uid);
        }
    }, [user]);

    const fetchSavedDissertations = async (uid) => {
        try {
            const q = query(
                collection(db, "dissertations"),
                where("userId", "==", uid),
                orderBy("lastModified", "desc")
            );
            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSavedDissertations(docs);
        } catch (error) {
            console.error("Error fetching dissertations:", error);
        }
    };

    const saveToFirestore = async (state) => {
        if (!state.userId || !state.topic) return;

        const data = {
            ...state,
            lastModified: Timestamp.now(),
            createdAt: state.createdAt || Timestamp.now()
        };

        try {
            if (state.id) {
                const docRef = doc(db, "dissertations", state.id);
                await updateDoc(docRef, data);
            } else {
                const docRef = await addDoc(collection(db, "dissertations"), data);
                setDissState(prev => ({ ...prev, id: docRef.id }));
            }
        } catch (error) {
            console.error("Error saving to Firestore:", error);
        }
    };

    // Auto-save effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (dissState.topic && dissState.userId && !loading) {
                saveToFirestore(dissState);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [dissState, loading]);

    const loadDissertation = async (id) => {
        setLoading(true);
        try {
            const docRef = doc(db, "dissertations", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const isActuallyCompleted = data.completed || (data.chapters?.[5]?.approved && data.chapters?.[5]?.content);
                const projectPlan = data.plan || 'free';

                setDissState({ ...data, id: docSnap.id, completed: isActuallyCompleted, plan: projectPlan });

                const welcomeMsg = {
                    role: 'ai',
                    content: `Welcome back! We are currently working on "${data.topic}".`
                };

                const resumptionMessages = [welcomeMsg];

                // Determine the correct "actionable" message to resume the UI
                if (isActuallyCompleted) {
                    resumptionMessages.push({
                        role: 'ai',
                        type: 'dissertation_complete',
                        content: 'All 5 chapters are complete! Your full dissertation is ready to export.'
                    });
                } else if (data.currentChapter > 0) {
                    const chNum = data.currentChapter;
                    const chap = data.chapters[chNum];

                    if (chap.content && chap.approved) {
                        // Chapter drafting is finished
                        if (chNum < 5) {
                            resumptionMessages.push({
                                role: 'ai',
                                type: 'chapter_complete',
                                chapterNum: chNum,
                                nextChapter: chNum + 1,
                                content: `Chapter ${chNum} is complete! Ready to move on to Chapter ${chNum + 1}.`
                            });
                        }
                    } else if (chap.approved) {
                        // Plan approved, waiting for drafting (citations should be ready)
                        resumptionMessages.push({
                            role: 'ai',
                            type: 'citations',
                            chapterNum: chNum,
                            citations: data.chapterCitations?.[chNum] || []
                        });
                    } else if (chap.plan) {
                        // Plan ready but not approved
                        resumptionMessages.push({
                            role: 'ai',
                            type: 'plan',
                            chapterNum: chNum,
                            plan: chap.plan
                        });
                    }
                }

                setMessages(resumptionMessages);
            }
        } catch (error) {
            console.error("Error loading dissertation:", error);
        } finally {
            setLoading(false);
        }
    };

    const getFullContent = () => {
        let bodyContent = '';
        for (let i = 1; i <= 5; i++) {
            const chapter = dissState.chapters[i];
            if (chapter?.content) {
                bodyContent += `<h2>${chapter.title}</h2>${chapter.content}`;
            }
        }
        if (dissState.references) {
            bodyContent += `<h2 style="page-break-before: always;">References</h2>${dissState.references}`;
        }
        return bodyContent;
    };

    const exportFullToWord = () => {
        const bodyContent = getFullContent();
        const docHtml = buildWordDoc(dissState.topic, bodyContent);
        const safeTitle = dissState.topic.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_');
        triggerDownload(docHtml, `${safeTitle}_Full.doc`);
    };

    const exportFullToPDF = () => {
        const bodyContent = getFullContent();
        const safeTitle = dissState.topic.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_');

        // Simple PDF export via browser print
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${dissState.topic}</title>
                    <style>
                        body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 2; text-align: justify; }
                        h1 { text-align: center; text-transform: uppercase; }
                        h2 { margin-top: 30px; page-break-before: always; }
                        p { margin-bottom: 15px; }
                        @media print {
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${dissState.topic}</h1>
                    ${bodyContent}
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

    const addMessage = useCallback((msg) => {
        setMessages(prev => [...prev, { ...msg, id: Date.now() + Math.random().toString(36).substr(2, 9) }]);
    }, []);

    // ... rest of the functions (generateTopics, generateChapterPlan, draftChapter, etc.)
    // Note: I'll need to keep the implementation of existing functions


    const generateTopics = async (program, region, interest) => {
        setLoading(true);
        addMessage({ role: 'user', content: `Generate topics for ${program} in ${region}${interest ? ` with interest in ${interest}` : ''}.` });

        const prompt = `Generate 10 researchable dissertation topics for a student in the program: "${program}", region: "${region}". ${interest ? `Specific interest: "${interest}"` : ''}
    For each topic, provide:
    1. A catchy but academic Title
    2. A 2-sentence Background
    3. A clear Problem Statement
    4. Three Specific Objectives
    
    Return ONLY a JSON array of objects with keys: "title", "background", "problem", "objectives" (as array).`;

        try {
            const raw = await callAI(prompt);
            const topics = safeJSON(raw);
            addMessage({
                role: 'ai',
                type: 'topics',
                content: "Here are some research topics tailored to your field and region:",
                topics: topics
            });
            setDissState(prev => ({ ...prev, program, region }));
        } catch (error) {
            console.error("[Dissertation] Topic Generation Error:", error);
            const provider = import.meta.env.VITE_AI_PROVIDER || 'gemini';
            const msg = error.message.includes("API keys")
                ? `${provider === 'claude' ? 'Claude' : 'Gemini'} API keys missing. Please set up your .env file.`
                : `Sorry, I had trouble generating topics using ${provider}. Please check your credits or API status.`;
            addMessage({ role: 'ai', content: msg });
        } finally {
            setLoading(false);
        }
    };

    const generateChapterPlan = useCallback(async (chapterNum, topic, isUpgrading = false) => {
        // Enforce plan restriction: Free projects can only do Chapter 1
        if (chapterNum > 1 && dissState.plan === 'free' && !isUpgrading) {
            addMessage({
                role: 'ai',
                type: 'upgrade_required',
                chapterNum: chapterNum,
                content: `This project is currently on the Free Plan. To unlock Chapter ${chapterNum} and the rest of this dissertation, please upgrade this project for 10,000 Tokens.`
            });
            return;
        }

        setLoading(true);
        setDissState(prev => ({ ...prev, currentChapter: chapterNum }));
        const config = CHAPTER_CONFIGS[chapterNum];
        const prompt = `Create a detailed chapter plan for Chapter ${chapterNum} of a dissertation on the topic: "${topic}".
    The chapter title is: "${dissState.chapters[chapterNum].title}".
    
    Structure the plan based on these sections:
    ${config.sections.map(s => `- ${s.heading}: ${s.description} (Target: ${s.defaultWords} words)`).join('\n')}
    
    For each section, provide:
    1. A detailed "purpose" (2-3 sentences)
    2. 3-4 "keyPoints" to cover
    
    Return ONLY a JSON array of objects with keys: "heading", "purpose", "keyPoints" (array), "wordsPerPara", "paragraphs".
    Use the target words and default paras from the structure provided.`;

        try {
            const raw = await callAI(prompt);
            const plan = safeJSON(raw);

            setDissState(prev => ({
                ...prev,
                chapters: {
                    ...prev.chapters,
                    [chapterNum]: { ...prev.chapters[chapterNum], plan }
                }
            }));

            addMessage({
                role: 'ai',
                type: 'plan',
                chapterNum: chapterNum,
                plan: plan
            });
        } catch (error) {
            console.error("[Dissertation] Plan Generation Error:", error);
            addMessage({ role: 'ai', content: `Failed to generate the chapter plan: ${error.message}` });
        } finally {
            setLoading(false);
        }
    }, [dissState, addMessage]);

    const addResearchData = (data) => {
        setDissState(prev => ({ ...prev, researchData: prev.researchData + "\n" + data }));
        addMessage({
            role: 'ai',
            content: "Research data added. I will incorporate this information into the next drafting segments to ensure your dissertation is grounded in your specific data."
        });
    };

    const generateCitations = useCallback(async (chapterNum) => {
        setLoading(true);
        const prompt = `Generate 5 high-quality academic citations (APA 7th style) for Chapter ${chapterNum} of a dissertation on: "${dissState.topic}".
    The chapter focus is: "${dissState.chapters[chapterNum].title}".
    
    For each citation, provide:
    1. Full APA Reference
    2. In-text citation format (e.g. Smith, 2023)
    3. A 1-sentence summary of why it's relevant.
    
    Return ONLY a JSON array of objects with keys: "reference", "inText", "relevance".`;

        try {
            const raw = await callAI(prompt);
            const citations = safeJSON(raw);

            setDissState(prev => ({
                ...prev,
                chapterCitations: {
                    ...prev.chapterCitations,
                    [chapterNum]: citations
                }
            }));

            addMessage({
                role: 'ai',
                type: 'citations',
                chapterNum: chapterNum,
                citations: citations
            });
        } catch (error) {
            console.error("[Dissertation] Citation Error:", error);
            addMessage({ role: 'ai', content: "Failed to generate citations. Please try again." });
        } finally {
            setLoading(false);
        }
    }, [dissState.topic, dissState.chapters, addMessage]);

    const draftChapter = useCallback(async (chapterNum) => {
        const chapter = dissState.chapters[chapterNum];
        if (!chapter.plan) return;

        setLoading(true);
        addMessage({
            role: 'ai',
            type: 'drafting_start',
            chapterNum: chapterNum
        });

        // Get citations for this chapter
        const citations = dissState.chapterCitations[chapterNum] || [];
        const citationContext = citations.map(c => `${c.reference} (In-text: ${c.inText})`).join('\n');

        let fullContent = "";
        const drafts = {};

        for (let i = 0; i < chapter.plan.length; i++) {
            const planItem = chapter.plan[i];
            const prompt = `Write a high-quality academic section for a dissertation Chapter ${chapterNum}.
    Topic: "${dissState.topic}"
    Section: "${planItem.heading}"
    Purpose: "${planItem.purpose}"
    Key Points: ${planItem.keyPoints.join(', ')}
    Target word count: ${planItem.wordsPerPara || 140} words.
    
    Academic style: Formal, third-person.
    ${dissState.researchData ? `Incorporate these findings: "${dissState.researchData}"` : ''}
    ${citations.length > 0 ? `Use and cite at least 2 of these sources correctly in APA style: \n${citationContext}` : ''}
    
    Return ONLY the section text.`;

            try {
                const draft = await callAI(prompt);
                const htmlDraft = draft.split(/\n\n+/).map(p => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`).join('');
                drafts[i] = htmlDraft;
                fullContent += `<h3>${planItem.heading}</h3>${htmlDraft}`;

                // Add small delay between segments to avoid hitting RPM limits
                await new Promise(r => setTimeout(r, 1000));

                setDissState(prev => {
                    const updatedChapters = { ...prev.chapters };
                    updatedChapters[chapterNum] = {
                        ...updatedChapters[chapterNum],
                        drafts: { ...updatedChapters[chapterNum].drafts, [i]: htmlDraft },
                        content: (updatedChapters[chapterNum].content || "") + `<h3>${planItem.heading}</h3>${htmlDraft}`
                    };

                    return {
                        ...prev,
                        chapters: updatedChapters,
                        references: prev.references + (i === chapter.plan.length - 1 ? "\n" + citations.map(c => `<p class="ref">${c.reference}</p>`).join('') : "")
                    };
                });

                addMessage({
                    role: 'ai',
                    type: 'draft_segment',
                    chapterNum: chapterNum,
                    index: i,
                    heading: planItem.heading,
                    content: draft
                });
            } catch (error) {
                console.error(`[Dissertation] Drafting segment ${i} failed:`, error);
            }
        }

        if (chapterNum < 5) {
            addMessage({
                role: 'ai',
                type: 'chapter_complete',
                chapterNum: chapterNum,
                nextChapter: chapterNum + 1,
                content: `Chapter ${chapterNum} is complete! Ready to move on to Chapter ${chapterNum + 1}.`
            });
        } else {
            const finalState = { ...dissState, completed: true };
            // Ensure chapter 5 is also marked as approved/finished in the state
            finalState.chapters[5] = { ...finalState.chapters[5], approved: true };

            setDissState(finalState);
            saveToFirestore(finalState); // Immediate save

            addMessage({
                role: 'ai',
                type: 'dissertation_complete',
                content: 'All 5 chapters are complete! Your dissertation is ready to export.'
            });
        }
        setLoading(false);
    }, [dissState, addMessage]);

    const approvePlan = useCallback((chapterNum, isUpgrading = false) => {
        // Double check plan restriction
        if (chapterNum > 1 && dissState.plan === 'free' && !isUpgrading) {
            addMessage({
                role: 'ai',
                type: 'upgrade_required',
                chapterNum: chapterNum,
                content: `Please upgrade this dissertation to Pro (10,000 Tokens) to approve the plan and start drafting Chapter ${chapterNum}.`
            });
            return;
        }

        setDissState(prev => ({
            ...prev,
            chapters: {
                ...prev.chapters,
                [chapterNum]: { ...prev.chapters[chapterNum], approved: true }
            }
        }));
        addMessage({
            role: 'ai',
            content: `Chapter ${chapterNum} plan approved. Let's find some academic sources first.`
        });
        generateCitations(chapterNum);
    }, [dissState.plan, addMessage, generateCitations]);

    const selectTopic = (topicData) => {
        setDissState(prev => ({
            ...prev,
            topic: topicData.title,
            selectedTopicData: topicData,
            currentChapter: 1
        }));
        addMessage({
            role: 'ai',
            content: `Excellent choice! Let's start Chapter 1: Study Overview for "${topicData.title}".`
        });
        generateChapterPlan(1, topicData.title);
    };

    const setManualTopic = (topic) => {
        setDissState(prev => ({
            ...prev,
            topic: topic,
            currentChapter: 1
        }));
        addMessage({
            role: 'ai',
            content: `Great topic: "${topic}". Starting Chapter 1.`
        });
        generateChapterPlan(1, topic);
    };

    const startNewDissertation = useCallback(() => {
        setDissState({ ...INITIAL_STATE, userId: user?.uid });
        setMessages([
            {
                role: 'ai',
                type: 'welcome',
                content: "Welcome to your new dissertation workspace. How can I help you today?"
            }
        ]);
    }, [user]);

    const buyPro = useCallback(async () => {
        if (!dissState.id) return;
        const newState = { ...dissState, plan: 'pro' };
        setDissState(newState);
        await saveToFirestore(newState);

        // Auto-resume: Find the last 'upgrade_required' message and re-trigger the action
        const lastUpgradeMsg = [...messages].reverse().find(m => m.type === 'upgrade_required');
        if (lastUpgradeMsg) {
            // Remove the upgrade_required message so the new action takes its place
            setMessages(prev => prev.filter(m => m.id !== lastUpgradeMsg.id));

            // Re-trigger the appropriate action based on the message content or chapterNum
            const chapterNum = lastUpgradeMsg.chapterNum;
            if (lastUpgradeMsg.content.includes("approve the plan")) {
                approvePlan(chapterNum, true);
            } else {
                generateChapterPlan(chapterNum, newState.topic, true);
            }
        }

        return true;
    }, [dissState, messages, approvePlan, generateChapterPlan]);

    return {
        dissState,
        savedDissertations,
        messages,
        loading,
        generateTopics,
        selectTopic,
        setManualTopic,
        approvePlan,
        addResearchData,
        generateCitations,
        draftChapter,
        generateChapterPlan,
        loadDissertation,
        startNewDissertation,
        exportFullToPDF,
        exportFullToWord,
        addMessage,
        buyPro
    };
};
