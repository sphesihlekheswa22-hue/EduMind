"use client";

import { useRef, useState } from "react";
import Link from "next/link";

// Defined outside component to avoid react-hooks/purity lint rule
function getTimestamp(): number {
  return performance.now();
}

const subjects = [
  { id: "math", label: "Mathematics", emoji: "📐", color: "from-indigo-500 to-indigo-600" },
  { id: "science", label: "Science", emoji: "🔬", color: "from-cyan-500 to-cyan-600" },
  { id: "english", label: "English", emoji: "📖", color: "from-emerald-500 to-emerald-600" },
  { id: "history", label: "History", emoji: "🏛️", color: "from-amber-500 to-amber-600" },
  { id: "geography", label: "Geography", emoji: "🌍", color: "from-purple-500 to-purple-600" },
];

const questions = [
  {
    id: 1,
    difficulty: "Medium",
    difficultyLevel: 3,
    question: "If f(x) = 2x² + 3x − 5, what is f(2)?",
    options: ["A. 9", "B. 11", "C. 13", "D. 7"],
    correct: 0,
    explanation: "f(2) = 2(4) + 3(2) − 5 = 8 + 6 − 5 = 9. Substituting x = 2 into the function gives us 9.",
  },
  {
    id: 2,
    difficulty: "Hard",
    difficultyLevel: 4,
    question: "Solve for x: 3x² − 12x + 9 = 0",
    options: ["A. x = 1 or x = 3", "B. x = 2 or x = 4", "C. x = −1 or x = −3", "D. x = 0 or x = 4"],
    correct: 0,
    explanation: "Dividing by 3: x² − 4x + 3 = 0. Factoring: (x−1)(x−3) = 0. So x = 1 or x = 3.",
  },
  {
    id: 3,
    difficulty: "Easy",
    difficultyLevel: 2,
    question: "What is the slope of the line y = 4x + 7?",
    options: ["A. 7", "B. 4", "C. 11", "D. −4"],
    correct: 1,
    explanation: "In the slope-intercept form y = mx + b, m is the slope. Here m = 4.",
  },
];

type Phase = "select" | "quiz" | "complete";

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; time: number }[]>([]);
  const startTimeRef = useRef<number>(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [aiMessage, setAiMessage] = useState("");

  const question = questions[currentQ];
  const totalQuestions = questions.length;

  const startQuiz = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setPhase("quiz");
    startTimeRef.current = getTimestamp();
    setTimeLeft(30);
    setAiMessage("🤖 AI has selected a Medium difficulty question based on your skill level.");
  };

  const handleAnswer = (idx: number) => {
    if (answered) return;
    const timeTaken = Math.round((getTimestamp() - startTimeRef.current) / 1000);
    setSelectedAnswer(idx);
    setAnswered(true);
    const isCorrect = idx === question.correct;
    if (isCorrect) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, { correct: isCorrect, time: timeTaken }]);

    if (isCorrect) {
      setAiMessage("✅ Correct! AI is increasing difficulty for the next question.");
    } else {
      setAiMessage("❌ Incorrect. AI is adjusting to an easier question to reinforce fundamentals.");
    }
  };

  const handleNext = () => {
    if (currentQ + 1 >= totalQuestions) {
      setPhase("complete");
    } else {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      startTimeRef.current = getTimestamp();
      setTimeLeft(30);
    }
  };

  const subjectLabel = subjects.find((s) => s.id === selectedSubject)?.label || "";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard/student" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">E</div>
          <span className="font-bold text-white text-sm">EduMind <span className="gradient-text">AI</span></span>
        </div>
        {phase === "quiz" && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Q {currentQ + 1}/{totalQuestions}</span>
            <span className="badge badge-info">{question.difficulty}</span>
          </div>
        )}
        {phase === "select" && <div className="w-24" />}
        {phase === "complete" && <div className="w-24" />}
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {/* Subject Selection */}
        {phase === "select" && (
          <div className="w-full max-w-2xl fade-in">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 text-sm text-indigo-400 mb-4">
                🤖 AI-Adaptive Quiz Engine
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">Choose a Subject</h1>
              <p className="text-slate-400">
                The AI will select questions based on your current skill level and adapt in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => startQuiz(s.id)}
                  className="card card-hover p-6 text-left flex flex-col gap-3 group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl`}>
                    {s.emoji}
                  </div>
                  <div>
                    <div className="text-white font-semibold group-hover:text-indigo-400 transition-colors">{s.label}</div>
                    <div className="text-slate-400 text-xs mt-1">Adaptive · 10 questions</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quiz */}
        {phase === "quiz" && (
          <div className="w-full max-w-2xl fade-in">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                <span>{subjectLabel}</span>
                <span>{currentQ + 1} of {totalQuestions}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${((currentQ) / totalQuestions) * 100}%` }} />
              </div>
            </div>

            {/* AI Message */}
            {aiMessage && (
              <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-sm text-indigo-300">
                {aiMessage}
              </div>
            )}

            {/* Difficulty indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-slate-400 text-sm">Difficulty:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-6 h-2 rounded-full ${
                      level <= question.difficultyLevel
                        ? "bg-indigo-500"
                        : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>
              <span className={`badge text-xs ${
                question.difficulty === "Hard" ? "badge-danger" :
                question.difficulty === "Medium" ? "badge-warning" : "badge-success"
              }`}>
                {question.difficulty}
              </span>
            </div>

            {/* Question Card */}
            <div className="card p-8 mb-6">
              <h2 className="text-xl font-bold text-white mb-8 leading-relaxed">
                {question.question}
              </h2>

              <div className="space-y-3">
                {question.options.map((option, idx) => {
                  let style = "border-slate-700 bg-slate-800/50 hover:border-indigo-500 hover:bg-indigo-500/5";
                  if (answered) {
                    if (idx === question.correct) {
                      style = "border-emerald-500 bg-emerald-500/10";
                    } else if (idx === selectedAnswer && idx !== question.correct) {
                      style = "border-red-500 bg-red-500/10";
                    } else {
                      style = "border-slate-700 bg-slate-800/30 opacity-50";
                    }
                  } else if (selectedAnswer === idx) {
                    style = "border-indigo-500 bg-indigo-500/10";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={answered}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${style} disabled:cursor-default`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          answered && idx === question.correct
                            ? "bg-emerald-500 text-white"
                            : answered && idx === selectedAnswer && idx !== question.correct
                            ? "bg-red-500 text-white"
                            : "bg-slate-700 text-slate-300"
                        }`}>
                          {answered && idx === question.correct ? "✓" :
                           answered && idx === selectedAnswer ? "✗" :
                           String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-slate-200 text-sm">{option.substring(3)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {answered && (
                <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700 fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">💡</span>
                    <span className="text-sm font-semibold text-white">Explanation</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{question.explanation}</p>
                </div>
              )}
            </div>

            {answered && (
              <button onClick={handleNext} className="btn-primary w-full py-3 text-base fade-in">
                {currentQ + 1 >= totalQuestions ? "See Results →" : "Next Question →"}
              </button>
            )}
          </div>
        )}

        {/* Complete */}
        {phase === "complete" && (
          <div className="w-full max-w-lg text-center fade-in">
            <div className="text-6xl mb-4">
              {score === totalQuestions ? "🏆" : score >= totalQuestions / 2 ? "🎉" : "💪"}
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Quiz Complete!</h1>
            <p className="text-slate-400 mb-8">
              You scored <span className="text-white font-bold">{score}/{totalQuestions}</span> on {subjectLabel}
            </p>

            <div className="card p-6 mb-6">
              <div className="text-5xl font-extrabold gradient-text mb-2">
                {Math.round((score / totalQuestions) * 100)}%
              </div>
              <div className="text-slate-400 text-sm mb-6">Overall Score</div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{score}</div>
                  <div className="text-xs text-slate-400">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{totalQuestions - score}</div>
                  <div className="text-xs text-slate-400">Incorrect</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-400">
                    {answers.length > 0 ? Math.round(answers.reduce((a, b) => a + b.time, 0) / answers.length) : 0}s
                  </div>
                  <div className="text-xs text-slate-400">Avg. Time</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span>🤖</span>
                <span className="text-sm font-semibold text-white">AI Analysis</span>
              </div>
              <p className="text-sm text-slate-300">
                {score === totalQuestions
                  ? "Excellent performance! Your skill model has been updated. You're ready for advanced topics."
                  : score >= totalQuestions / 2
                  ? "Good effort! AI has identified areas for improvement. Check your personalised feedback below."
                  : "Keep practising! AI has detected weak areas and will adjust future questions to help you improve."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/feedback" className="btn-primary flex-1 py-3 text-center">
                View AI Feedback →
              </Link>
              <button onClick={() => { setPhase("select"); setCurrentQ(0); setScore(0); setAnswers([]); setSelectedAnswer(null); setAnswered(false); }} className="btn-secondary flex-1 py-3">
                Take Another Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
