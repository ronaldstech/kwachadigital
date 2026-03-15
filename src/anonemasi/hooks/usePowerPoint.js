import { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, Timestamp, orderBy, deleteDoc, increment } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { extractDocText, extractPptxData, generateSlideData, sanitiseSlides } from '../services/powerpointService';

const INITIAL_STATE = {
    id: null,
    userId: null,
    topic: "", // Generated or derived topic
    slides: [],
    config: {
        slideCount: 10,
        pointsPerSlide: 3,
        linesPerPoint: "medium",
        audience: "Professional",
        focus: "Content & Clarity",
        style: "fresh",
        styleRef: true
    },
    // Keep extData here so it's restored upon loading
    extData: {
        mainText: "",
        sourceText: "",
        tplTheme: null,
        tplText: "",
        ccTheme: null,
        ccText: ""
    },
    createdAt: null,
    lastModified: null,
};

export const usePowerPoint = () => {
    const { user } = useAuth();
    const [powerPointState, setPowerPointState] = useState(INITIAL_STATE);
    const [savedPowerPoints, setSavedPowerPoints] = useState([]);
    const [loading, setLoading] = useState(false);

    // UI specific states managed by the hook to keep them in sync with backend saves
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi! I'm your PowerPoint architect. What are we presenting today?", type: "text" }
    ]);
    const [files, setFiles] = useState({
        main: null,
        sources: [],
        template: null,
        copycat: null
    });

    // Update userId when user changes
    useEffect(() => {
        if (user) {
            setPowerPointState(prev => ({ ...prev, userId: user.uid }));
            fetchSavedPowerPoints(user.uid);
        }
    }, [user]);

    const fetchSavedPowerPoints = async (uid) => {
        try {
            const q = query(
                collection(db, "powerpoints"),
                where("userId", "==", uid),
                orderBy("lastModified", "desc")
            );
            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(doc => {
                const data = doc.data();
                if (data.topic && typeof data.topic === 'object') {
                    data.topic = data.topic.title || "Untitled Presentation";
                }
                return { id: doc.id, ...data };
            });
            setSavedPowerPoints(docs);
        } catch (error) {
            console.error("Error fetching PowerPoints:", error);
        }
    };

    const saveToFirestore = async (state) => {
        // Require at least a topic to save (to avoid saving empty clicks)
        if (!state.userId || !state.topic) return state;

        const data = {
            ...state,
            lastModified: Timestamp.now(),
            createdAt: state.createdAt || Timestamp.now()
        };

        try {
            if (state.id) {
                const docRef = doc(db, "powerpoints", state.id);
                await updateDoc(docRef, data);
                return state;
            } else {
                const docRef = await addDoc(collection(db, "powerpoints"), data);
                const newState = { ...state, id: docRef.id };
                setPowerPointState(newState);
                fetchSavedPowerPoints(state.userId);
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
            if (powerPointState.topic && powerPointState.userId && !loading) {
                saveToFirestore(powerPointState);
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [powerPointState, loading]);

    const loadPowerPoint = async (id) => {
        setLoading(true);
        try {
            const docRef = doc(db, "powerpoints", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.topic && typeof data.topic === 'object') {
                    data.topic = data.topic.title || "Untitled Presentation";
                }
                setPowerPointState({ ...data, id: docSnap.id });

                // Clear out file references since they are Blob/File objects that don't persist
                setFiles({ main: null, sources: [], template: null, copycat: null });

                const resumptionMessages = [
                    {
                        role: 'assistant',
                        content: `Welcome back! I've loaded your presentation: "${data.topic}".`,
                        type: "text"
                    }
                ];

                if (data.slides && data.slides.length > 0) {
                    resumptionMessages.push({
                        role: "assistant",
                        content: `You have ${data.slides.length} slides ready. You can preview them on the right.`,
                        type: "text",
                        actionable: true
                    });
                }

                setMessages(resumptionMessages);
            }
        } catch (error) {
            console.error("Error loading PowerPoint:", error);
        } finally {
            setLoading(false);
        }
    };

    const startNewPowerPoint = () => {
        setPowerPointState({ ...INITIAL_STATE, userId: user?.uid });
        setFiles({ main: null, sources: [], template: null, copycat: null });
        setMessages([
            {
                role: "assistant",
                content: "Hi! I'm your PowerPoint architect. What are we presenting today?",
                type: "text"
            }
        ]);
        if (user) fetchSavedPowerPoints(user.uid);
    };

    const deletePowerPoint = async (id) => {
        try {
            await deleteDoc(doc(db, "powerpoints", id));
            if (powerPointState.id === id) {
                startNewPowerPoint();
            } else {
                fetchSavedPowerPoints(user.uid);
            }
        } catch (error) {
            console.error("Error deleting PowerPoint:", error);
        }
    };

    const updateConfig = (newConfig) => {
        setPowerPointState(prev => {
            const updated = { ...prev, config: { ...prev.config, ...newConfig } };
            // Save state updates implicitly if there's a topic
            return updated;
        });
    };

    const updateExtData = (newData) => {
        setPowerPointState(prev => {
            return { ...prev, extData: { ...prev.extData, ...newData } };
        });
    };

    const runGeneration = async (userInput) => {
        const { extData, config } = powerPointState;

        if (!userInput.trim() && !extData.mainText) {
            return { success: false, message: "Please provide a topic or upload a document" };
        }

        // Check if user has exceeded their free tier and has no credits
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const powerpointsGenerated = userData.powerpointsGenerated || 0;
                    const essaysGenerated = userData.essaysGenerated || 0;
                    const totalGenerated = powerpointsGenerated + essaysGenerated;
                    const credits = userData.powerpointCredits || 0;
                    
                    if (totalGenerated >= 1 && credits <= 0) {
                        return { success: false, requirePayment: true };
                    }
                }
            } catch (err) {
                console.error("Error checking quota:", err);
            }
        }

        setLoading(true);
        const userMsg = userInput.trim();

        setMessages(prev => [...prev, { role: "user", content: userMsg || "Generate from document", type: "text" }]);

        try {
            const combinedContent = (extData.mainText + "\n" + extData.sourceText).trim();
            const slideData = await generateSlideData(combinedContent, userMsg, config, extData);

            const cleanSlides = sanitiseSlides(slideData);

            // Derive a topic title from user input, or just "Presentation"
            let generatedTopic = userMsg.substring(0, 50);
            if (!generatedTopic) generatedTopic = "Presentation from Document";
            if (cleanSlides.length > 0 && cleanSlides[0].title) {
                generatedTopic = typeof cleanSlides[0].title === 'object'
                    ? (cleanSlides[0].title.title || "Presentation")
                    : cleanSlides[0].title;
            }

            const newState = {
                ...powerPointState,
                topic: generatedTopic,
                slides: cleanSlides
            };

            const savedState = await saveToFirestore(newState);
            setPowerPointState(savedState);

            // Update user quotas
            if (user) {
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const credits = userSnap.data().powerpointCredits || 0;
                        await updateDoc(userRef, {
                            powerpointsGenerated: increment(1),
                            ...(credits > 0 ? { powerpointCredits: increment(-1) } : {})
                        });
                    }
                } catch (err) {
                    console.error("Error updating user quota:", err);
                }
            }

            setMessages(prev => [...prev, {
                role: "assistant",
                content: `I've generated ${cleanSlides.length} slides for your presentation. You can preview them on the right.`,
                type: "text",
                actionable: true
            }]);

            return { success: true, message: "Slides generated!", slides: cleanSlides };

        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error: " + err.message, type: "error" }]);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    // File handling helpers
    const handleFileUpload = async (file, type) => {
        if (!file) return { success: false, message: "No file provided" };

        setLoading(true);
        try {
            if (type === "sources") {
                const text = await extractDocText(file);
                setFiles(prev => ({ ...prev, sources: [...prev.sources, file] }));
                updateExtData({ sourceText: powerPointState.extData.sourceText + "\n\n" + text });
                return { success: true, message: `Source "${file.name}" added` };
            } else if (type === "template") {
                const data = await extractPptxData(file);
                setFiles(prev => ({ ...prev, template: file }));
                updateExtData({ tplTheme: data.theme, tplText: data.text });
                updateConfig({ style: "template" });
                return { success: true, message: "Template processed" };
            } else if (type === "copycat") {
                const data = await extractPptxData(file);
                setFiles(prev => ({ ...prev, copycat: file }));
                updateExtData({ ccTheme: data.theme, ccText: data.text });
                updateConfig({ style: "copycat" });
                return { success: true, message: "Reference deck processed" };
            } else {
                const text = await extractDocText(file);
                setFiles(prev => ({ ...prev, main: file }));
                updateExtData({ mainText: text });
                return { success: true, message: `Main document "${file.name}" uploaded` };
            }
        } catch (err) {
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        powerPointState,
        savedPowerPoints,
        messages,
        files,
        loading,
        setFiles,
        loadPowerPoint,
        startNewPowerPoint,
        deletePowerPoint,
        updateConfig,
        runGeneration,
        handleFileUpload
    };
};
