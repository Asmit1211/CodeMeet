import { LightbulbIcon, SparklesIcon, RefreshCwIcon, CheckCircleIcon, BookOpenIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const INTERVIEW_TIPS = [
    "Practice Big O notation for every solution — time AND space complexity.",
    "Always think out loud during coding interviews. Silence is your enemy.",
    "Clarify constraints before writing a single line of code.",
    "Start with the brute-force approach, then optimize step by step.",
    "Use meaningful variable names, even in interviews. Clean code impresses.",
    "Test your solution with edge cases: empty inputs, single elements, negatives.",
    "Master the top 5 patterns: Sliding Window, Two Pointers, BFS/DFS, DP, Binary Search.",
    "Take a deep breath before answering. A 3-second pause looks confident, not slow.",
    "Don't just solve the problem — explain WHY your approach works.",
    "Practice writing code on a whiteboard or plain editor. No autocomplete in real interviews.",
    "Ask about the expected input size — it hints at the required time complexity.",
    "If you're stuck, break the problem into smaller sub-problems.",
    "Review your solution before saying 'I'm done.' Interviewers notice self-review.",
    "Prepare 2–3 strong project stories using the STAR method.",
    "Study the company's tech stack before the interview. It shows genuine interest.",
];

const CHECKLIST = [
    "Check Camera & Microphone",
    "Prepare your Introduction",
    "Review Time Complexity",
    "Keep water & notes handy",
];

const TOPICS = [
    { label: "DSA", color: "badge-primary" },
    { label: "System Design", color: "badge-secondary" },
    { label: "Behavioral", color: "badge-accent" },
    { label: "Puzzles", color: "badge-warning" },
];

function InterviewTips() {
    const [currentTipIndex, setCurrentTipIndex] = useState(
        () => Math.floor(Math.random() * INTERVIEW_TIPS.length)
    );
    const [isVisible, setIsVisible] = useState(true);

    const nextTip = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => {
            setCurrentTipIndex((prev) => (prev + 1) % INTERVIEW_TIPS.length);
            setIsVisible(true);
        }, 300);
    }, []);

    useEffect(() => {
        const interval = setInterval(nextTip, 15000);
        return () => clearInterval(interval);
    }, [nextTip]);

    return (
        <div className="card bg-base-100 shadow-xl border border-warning/20 hover:border-warning/40 transition-colors duration-300 h-full">
            <div className="card-body justify-between">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="card-title text-xl gap-2">
                        <div className="p-2 bg-warning/10 rounded-xl">
                            <LightbulbIcon className="w-6 h-6 text-warning" />
                        </div>
                        Interview Pro Tips
                    </h2>
                    <button
                        onClick={nextTip}
                        className="btn btn-ghost btn-xs btn-circle tooltip tooltip-left"
                        data-tip="Next tip"
                    >
                        <RefreshCwIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Rotating Tip */}
                <div className="min-h-[70px] flex items-center py-2">
                    <div
                        className={`flex items-start gap-3 transition-all duration-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                            }`}
                    >
                        <SparklesIcon className="w-5 h-5 text-warning shrink-0 mt-1" />
                        <p className="text-base-content/80 text-lg leading-relaxed font-medium">
                            {INTERVIEW_TIPS[currentTipIndex]}
                        </p>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-base-content/40">
                        Tip {currentTipIndex + 1} of {INTERVIEW_TIPS.length}
                    </span>
                    <div className="flex gap-1">
                        {INTERVIEW_TIPS.map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === currentTipIndex ? "bg-warning" : "bg-base-300"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Separator */}
                <div className="divider my-1"></div>

                {/* Interview Readiness Checklist */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpenIcon className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm">Interview Readiness</span>
                    </div>
                    <ul className="space-y-1.5">
                        {CHECKLIST.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-base-content/70">
                                <CheckCircleIcon className="w-4 h-4 text-success shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Key Topics Badges */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-base-300 mt-2">
                    {TOPICS.map((topic) => (
                        <span key={topic.label} className={`badge ${topic.color} badge-sm badge-outline`}>
                            {topic.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default InterviewTips;
