import React from 'react';
import { ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const steps = [
    { id: 1, label: 'Ch. 1' },
    { id: 2, label: 'Ch. 2' },
    { id: 3, label: 'Ch. 3' },
    { id: 4, label: 'Ch. 4' },
    { id: 5, label: 'Ch. 5' },
];

const ChapterTracker = ({ currentChapter = 0, completed = false }) => {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-1">
                <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_6px_rgba(99,102,241,0.6)] ${completed ? 'bg-green-500 shadow-green-500/40' : 'bg-indigo-500 shadow-indigo-500/40'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${completed ? 'text-green-600 dark:text-green-400' : 'text-indigo-500 dark:text-indigo-400'}`}>
                    {completed ? 'Dissertation Complete' : currentChapter > 0 ? `Chapter ${currentChapter}` : 'Topic Selection'}
                </span>
            </div>

            <div className="hidden md:block h-3.5 w-px bg-glass-border mx-1" />

            <div className="hidden md:flex items-center gap-1.5">
                {steps.map((step, i) => {
                    const stepNum = i + 1;
                    const isStepCompleted = stepNum < currentChapter || (stepNum === currentChapter && completed);
                    const isStepActive = stepNum === currentChapter && !completed;

                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex items-center gap-1">
                                <div className={`w-4.5 h-4 px-1.5 rounded flex items-center justify-center text-[9px] font-bold transition-all ${isStepCompleted
                                        ? 'bg-green-500/15 border border-green-500/30 text-green-500 dark:text-green-400'
                                        : isStepActive
                                            ? 'bg-indigo-500/15 border border-indigo-500/40 text-indigo-500 dark:text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.25)]'
                                            : 'bg-surface-1 border border-glass-border text-text-secondary opacity-50'
                                    }`}>
                                    {stepNum}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider transition-all hidden sm:block ${stepNum <= currentChapter ? 'text-text-primary' : 'text-text-secondary opacity-40'
                                    }`}>
                                    {step.label}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <ChevronRight size={10} className="text-glass-border opacity-60" />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

        </div>
    );
};

export default ChapterTracker;
