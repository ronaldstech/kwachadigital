import React, { useState, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';

const InputPanel = ({ loading, onSend }) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef(null);

    const handleInput = (e) => {
        setInput(e.target.value);
        autoGrow();
    };

    const autoGrow = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !loading) {
            onSend(input);
            setInput('');
            setTimeout(() => {
                if (textareaRef.current) textareaRef.current.style.height = 'auto';
            }, 0);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <footer className="p-3 pb-4 border-t border-glass-border bg-bg-main z-10 shrink-0">
            <div className="max-w-4xl mx-auto">
                <div className="relative bg-surface-1 border border-glass-border rounded-xl shadow-sm focus-within:border-indigo-400 dark:focus-within:border-indigo-500/50 transition-all">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your dissertation topic, paste a concept note, or ask anything…"
                        className="w-full bg-transparent border-none focus:ring-0 text-text-primary p-3 lg:p-3.5 pr-20 lg:pr-24 resize-none text-[13px] lg:text-sm leading-relaxed custom-scrollbar placeholder:text-text-muted/50"
                    />

                    <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
                        <button
                            className="p-2 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text-primary transition-all"
                            title="Attach Brief"
                        >
                            <Paperclip size={15} />
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!input.trim() || loading}
                            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-500/20"
                        >
                            <Send size={15} />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default InputPanel;
