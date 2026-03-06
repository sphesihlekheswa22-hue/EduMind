"use client";

import { useCallback, useRef, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import type { QuizQuestion } from "@/app/api/study-assistant/generate-quiz/route";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface UploadedFile {
  fileId: string;
  fileName: string;
  fileSize: number;
}

interface SummaryData {
  summary: string;
  keyConcepts: string[];
  importantTopics: string[];
}

type ActiveTab = "upload" | "summary" | "chat" | "quiz";
type QuizPhase = "idle" | "generating" | "taking" | "results";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^• (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li><strong>$1.</strong> $2</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />");
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudyAssistantPage() {
  // File upload state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text input state
  const [textInput, setTextInput] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [textError, setTextError] = useState("");

  // Summary state
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Quiz state
  const [quizPhase, setQuizPhase] = useState<QuizPhase>("idle");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [quizError, setQuizError] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("upload");

  // ─── File Upload ────────────────────────────────────────────────────────────

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadError("");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/study-assistant/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed. Please try again.");
        return;
      }

      setUploadedFile({
        fileId: data.fileId,
        fileName: data.fileName,
        fileSize: data.fileSize,
      });

      // Reset downstream state
      setSummaryData(null);
      setChatHistory([]);
      setQuizPhase("idle");
      setQuizQuestions([]);
      setActiveTab("summary");

      // Auto-trigger summarization
      await triggerSummarize(data.fileId);
    } catch {
      setUploadError("Network error. Please check your connection and try again.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const triggerSummarize = async (fileId: string) => {
    setIsSummarizing(true);
    setSummaryError("");

    try {
      const res = await fetch("/api/study-assistant/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSummaryError(data.error || "Summarization failed.");
        return;
      }

      setSummaryData({
        summary: data.summary,
        keyConcepts: data.keyConcepts,
        importantTopics: data.importantTopics,
      });
    } catch {
      setSummaryError("AI summarization failed. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  // ─── Text Input ─────────────────────────────────────────────────────────────

  const handleTextSubmit = async () => {
    if (!textInput.trim() || textInput.trim().length < 50) {
      setTextError("Please enter at least 50 characters of text.");
      return;
    }

    setTextError("");
    setIsProcessingText(true);

    try {
      const res = await fetch("/api/study-assistant/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput, title: textTitle || "Pasted Notes" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setTextError(data.error || "Failed to process text. Please try again.");
        return;
      }

      setUploadedFile({
        fileId: data.fileId,
        fileName: data.fileName,
        fileSize: data.contentLength,
      });

      // Reset downstream state
      setSummaryData(null);
      setChatHistory([]);
      setQuizPhase("idle");
      setQuizQuestions([]);
      setActiveTab("summary");

      // Clear text input
      setTextInput("");
      setTextTitle("");

      // Auto-trigger summarization
      await triggerSummarize(data.fileId);
    } catch {
      setTextError("Network error. Please check your connection and try again.");
    } finally {
      setIsProcessingText(false);
    }
  };

  // ─── Chat ───────────────────────────────────────────────────────────────────

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !uploadedFile || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatError("");
    setIsChatLoading(true);

    const newHistory: ChatMessage[] = [...chatHistory, { role: "user", content: userMessage }];
    setChatHistory(newHistory);

    // Scroll to bottom
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const res = await fetch("/api/study-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: uploadedFile.fileId,
          message: userMessage,
          history: chatHistory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setChatError(data.error || "Chat failed. Please try again.");
        return;
      }

      setChatHistory(data.history);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      setChatError("Network error. Please try again.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  // ─── Quiz ───────────────────────────────────────────────────────────────────

  const generateQuiz = async () => {
    if (!uploadedFile) return;

    setQuizPhase("generating");
    setQuizError("");
    setSelectedAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setShowExplanation(false);

    try {
      const res = await fetch("/api/study-assistant/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: uploadedFile.fileId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setQuizError(data.error || "Quiz generation failed.");
        setQuizPhase("idle");
        return;
      }

      setQuizQuestions(data.questions);
      setSelectedAnswers(new Array(data.questions.length).fill(-1));
      setQuizPhase("taking");
    } catch {
      setQuizError("Failed to generate quiz. Please try again.");
      setQuizPhase("idle");
    }
  };

  const selectAnswer = (answerIndex: number) => {
    if (showExplanation) return;
    const updated = [...selectedAnswers];
    updated[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(updated);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      // Calculate score
      const score = quizQuestions.reduce((acc, q, i) => {
        return acc + (selectedAnswers[i] === q.correctIndex ? 1 : 0);
      }, 0);
      setQuizScore(score);
      setQuizPhase("results");
    }
  };

  const resetQuiz = () => {
    setQuizPhase("idle");
    setQuizQuestions([]);
    setSelectedAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setShowExplanation(false);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const tabs: { id: ActiveTab; label: string; icon: string; disabled: boolean }[] = [
    { id: "upload", label: "Upload Notes", icon: "📁", disabled: false },
    { id: "summary", label: "View Summary", icon: "📋", disabled: !uploadedFile },
    { id: "chat", label: "Ask AI Questions", icon: "💬", disabled: !uploadedFile },
    { id: "quiz", label: "Generate Quiz", icon: "🧠", disabled: !uploadedFile },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950">
      <DashboardSidebar role="student" userName="Alex Johnson" userEmail="alex@student.edu" />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Study Assistant</h1>
              <p className="text-slate-400 text-sm">Paste your notes or upload files — get AI-powered summaries, explanations, and quizzes</p>
            </div>
          </div>

          {/* Uploaded file badge */}
          {uploadedFile && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <span className="text-emerald-400 text-sm">✓</span>
              <span className="text-sm text-emerald-300 font-medium">{uploadedFile.fileName}</span>
              <span className="text-xs text-slate-400">({formatFileSize(uploadedFile.fileSize)})</span>
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setSummaryData(null);
                  setChatHistory([]);
                  setQuizPhase("idle");
                  setActiveTab("upload");
                }}
                className="ml-2 text-slate-400 hover:text-red-400 transition-colors text-xs"
              >
                ✕ Remove
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : tab.disabled
                  ? "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Upload ── */}
        {activeTab === "upload" && (
          <div className="max-w-3xl space-y-8">
            {/* Text Input Section */}
            <div className="card p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>📝</span> Paste Your Notes
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Directly paste your study notes or lecture text for instant AI analysis. Best results with 100+ words.
              </p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title (optional): e.g., Biology Chapter 1 Notes"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  className="input-field w-full"
                  disabled={isProcessingText}
                />
                
                <textarea
                  placeholder="Paste your notes here... (at least 50 characters)"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="input-field w-full h-48 resize-none"
                  disabled={isProcessingText}
                />

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">
                    {textInput.trim().length} characters ({textInput.trim().split(/\s+/).filter(Boolean).length} words)
                  </span>
                  <button
                    onClick={handleTextSubmit}
                    disabled={isProcessingText || textInput.trim().length < 50}
                    className="btn-primary px-6 py-2.5"
                  >
                    {isProcessingText ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Analyze Text"
                    )}
                  </button>
                </div>

                {textError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2">
                    <span className="text-red-400">⚠️</span>
                    <p className="text-red-300 text-sm">{textError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-700" />
              <span className="text-slate-500 text-sm">or upload a file</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>

            {/* File Upload Section */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-indigo-400 bg-indigo-500/10"
                  : isUploading
                  ? "border-slate-600 bg-slate-800/30 cursor-not-allowed"
                  : "border-slate-600 bg-slate-800/20 hover:border-indigo-500 hover:bg-indigo-500/5"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={onFileInputChange}
                className="hidden"
                disabled={isUploading}
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                  <p className="text-slate-300 font-medium">Processing your notes...</p>
                  <p className="text-slate-500 text-sm">Extracting text and preparing AI analysis</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-3xl">
                    📄
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">Drop your study notes here</p>
                    <p className="text-slate-400 mt-1">or click to browse files</p>
                  </div>
                  <div className="flex gap-3 mt-2">
                    {["PDF", "DOCX", "TXT"].map((ext) => (
                      <span key={ext} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium">
                        .{ext}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-500 text-xs">Maximum file size: 20MB</p>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <span className="text-red-400 text-lg flex-shrink-0">⚠️</span>
                <p className="text-red-300 text-sm">{uploadError}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="card p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>💡</span> How it works
              </h3>
              <div className="space-y-3">
                {[
                  { step: "1", title: "Paste your notes or upload a file", desc: "Copy-paste text directly OR upload PDF/DOCX/TXT files" },
                  { step: "2", title: "AI processes your content", desc: "Our AI extracts text and identifies key concepts" },
                  { step: "3", title: "Get a smart summary", desc: "View a concise summary with key topics highlighted" },
                  { step: "4", title: "Ask questions", desc: "Chat with AI about your notes like a personal tutor" },
                  { step: "5", title: "Take a quiz", desc: "Generate and take a quiz based on your material" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <span className="text-white text-sm font-medium">{item.title}</span>
                      <span className="text-slate-400 text-sm"> — {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Summary ── */}
        {activeTab === "summary" && (
          <div className="max-w-4xl space-y-6">
            {isSummarizing ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-white font-medium">AI is analysing your notes...</p>
                <p className="text-slate-400 text-sm mt-1">Generating summary, key concepts, and topics</p>
              </div>
            ) : summaryError ? (
              <div className="card p-6">
                <div className="flex items-center gap-3 text-red-400 mb-4">
                  <span className="text-2xl">⚠️</span>
                  <p className="font-medium">Summarization failed</p>
                </div>
                <p className="text-slate-400 text-sm mb-4">{summaryError}</p>
                <button
                  onClick={() => uploadedFile && triggerSummarize(uploadedFile.fileId)}
                  className="btn-primary text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : summaryData ? (
              <>
                {/* Summary */}
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📋</span>
                    <h2 className="text-lg font-bold text-white">AI Summary</h2>
                    <span className="badge badge-info text-xs ml-auto">AI Generated</span>
                  </div>
                  <div
                    className="text-slate-300 text-sm leading-relaxed space-y-2"
                    dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(summaryData.summary)}</p>` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Key Concepts */}
                  <div className="card p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">🔑</span>
                      <h2 className="text-lg font-bold text-white">Key Concepts</h2>
                    </div>
                    <div className="space-y-2">
                      {summaryData.keyConcepts.map((concept, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </div>
                          <span className="text-slate-200 text-sm">{concept}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Important Topics */}
                  <div className="card p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">📌</span>
                      <h2 className="text-lg font-bold text-white">Important Topics</h2>
                    </div>
                    <div className="space-y-2">
                      {summaryData.importantTopics.map((topic, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                          <span className="text-cyan-400 text-sm">→</span>
                          <span className="text-slate-200 text-sm">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button onClick={() => setActiveTab("chat")} className="btn-primary flex items-center gap-2">
                    <span>💬</span> Ask AI Questions
                  </button>
                  <button onClick={() => setActiveTab("quiz")} className="btn-secondary flex items-center gap-2">
                    <span>🧠</span> Generate Quiz
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ── Tab: Chat ── */}
        {activeTab === "chat" && (
          <div className="max-w-3xl flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
            <div className="card flex flex-col flex-1 overflow-hidden">
              {/* Chat header */}
              <div className="p-4 border-b border-slate-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-sm">
                  🤖
                </div>
                <div>
                  <p className="text-white font-medium text-sm">AI Tutor</p>
                  <p className="text-slate-400 text-xs">Based on: {uploadedFile?.fileName}</p>
                </div>
                <div className="ml-auto">
                  <span className="badge badge-success text-xs">Online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-white font-medium mb-2">Ask me anything about your notes!</p>
                    <p className="text-slate-400 text-sm mb-6">I&apos;ll answer based on the content you uploaded.</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        "Summarize the main points",
                        "What are the key concepts?",
                        "Explain the most important topic",
                        "Give me practice questions",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => { setChatInput(suggestion); }}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl text-sm transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                        msg.role === "user"
                          ? "bg-indigo-500/30 text-indigo-300"
                          : "bg-gradient-to-br from-indigo-500 to-cyan-500 text-white"
                      }`}>
                        {msg.role === "user" ? "👤" : "🤖"}
                      </div>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-sm"
                          : "bg-slate-700 text-slate-200 rounded-tl-sm"
                      }`}>
                        {msg.role === "assistant" ? (
                          <div
                            className="leading-relaxed space-y-1"
                            dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(msg.content)}</p>` }}
                          />
                        ) : (
                          <p className="leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {isChatLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-sm flex-shrink-0">
                      🤖
                    </div>
                    <div className="bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1 items-center h-5">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Error */}
              {chatError && (
                <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
                  <p className="text-red-400 text-xs">{chatError}</p>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-slate-700">
                <div className="flex gap-3">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    placeholder="Ask a question about your notes... (Enter to send)"
                    rows={2}
                    className="input-field flex-1 resize-none text-sm"
                    disabled={isChatLoading}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="btn-primary px-4 self-end disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                <p className="text-slate-500 text-xs mt-2">Press Enter to send · Shift+Enter for new line</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Quiz ── */}
        {activeTab === "quiz" && (
          <div className="max-w-3xl">
            {/* Idle state */}
            {quizPhase === "idle" && (
              <div className="card p-8 text-center">
                <div className="text-5xl mb-4">🧠</div>
                <h2 className="text-xl font-bold text-white mb-2">Generate Quiz from Notes</h2>
                <p className="text-slate-400 mb-2">
                  AI will create <strong className="text-white">5–8 multiple choice questions</strong> based on your uploaded notes.
                </p>
                <p className="text-slate-500 text-sm mb-8">
                  Each question has 4 options with one correct answer and an explanation.
                </p>

                {quizError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                    {quizError}
                  </div>
                )}

                <button onClick={generateQuiz} className="btn-primary text-base px-8 py-3">
                  🎯 Generate Quiz Now
                </button>

                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  {[
                    { icon: "📝", label: "5–8 Questions", desc: "Auto-generated" },
                    { icon: "🎯", label: "4 Options", desc: "Per question" },
                    { icon: "💡", label: "Explanations", desc: "For each answer" },
                  ].map((item) => (
                    <div key={item.label} className="p-4 bg-slate-800/50 rounded-xl">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-white text-sm font-medium">{item.label}</div>
                      <div className="text-slate-400 text-xs">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generating state */}
            {quizPhase === "generating" && (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-white font-medium">AI is generating your quiz...</p>
                <p className="text-slate-400 text-sm mt-1">Creating questions based on your study notes</p>
              </div>
            )}

            {/* Taking quiz */}
            {quizPhase === "taking" && quizQuestions.length > 0 && (
              <div className="space-y-6">
                {/* Progress */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </span>
                  <span className="text-slate-400 text-sm">
                    Score: {selectedAnswers.filter((a, i) => a === quizQuestions[i]?.correctIndex).length}/{currentQuestionIndex + (showExplanation ? 1 : 0)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${((currentQuestionIndex + (showExplanation ? 1 : 0)) / quizQuestions.length) * 100}%` }}
                  />
                </div>

                {/* Question card */}
                <div className="card p-6">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {currentQuestionIndex + 1}
                    </div>
                    <p className="text-white font-medium leading-relaxed">
                      {quizQuestions[currentQuestionIndex].question}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {quizQuestions[currentQuestionIndex].options.map((option, optIdx) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                      const isCorrect = optIdx === quizQuestions[currentQuestionIndex].correctIndex;
                      const showResult = showExplanation;

                      let optionClass = "border-slate-600 bg-slate-800/50 hover:border-indigo-400 hover:bg-indigo-500/5 cursor-pointer";
                      if (showResult && isCorrect) {
                        optionClass = "border-emerald-500 bg-emerald-500/10 cursor-default";
                      } else if (showResult && isSelected && !isCorrect) {
                        optionClass = "border-red-500 bg-red-500/10 cursor-default";
                      } else if (showResult) {
                        optionClass = "border-slate-700 bg-slate-800/30 opacity-60 cursor-default";
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => selectAnswer(optIdx)}
                          disabled={showExplanation}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${optionClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              showResult && isCorrect
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : showResult && isSelected && !isCorrect
                                ? "border-red-500 bg-red-500 text-white"
                                : "border-slate-500 text-slate-400"
                            }`}>
                              {showResult && isCorrect ? "✓" : showResult && isSelected && !isCorrect ? "✗" : String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className={`text-sm ${showResult && isCorrect ? "text-emerald-300 font-medium" : showResult && isSelected && !isCorrect ? "text-red-300" : "text-slate-200"}`}>
                              {option}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {showExplanation && (
                    <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                      <p className="text-indigo-300 text-sm font-medium mb-1">💡 Explanation</p>
                      <p className="text-slate-300 text-sm">{quizQuestions[currentQuestionIndex].explanation}</p>
                    </div>
                  )}
                </div>

                {/* Next button */}
                {showExplanation && (
                  <button onClick={nextQuestion} className="btn-primary w-full py-3">
                    {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question →" : "See Results 🎉"}
                  </button>
                )}
              </div>
            )}

            {/* Results */}
            {quizPhase === "results" && (
              <div className="space-y-6">
                <div className="card p-8 text-center">
                  <div className="text-5xl mb-4">
                    {quizScore / quizQuestions.length >= 0.8 ? "🏆" : quizScore / quizQuestions.length >= 0.6 ? "👍" : "📚"}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
                  <div className="text-5xl font-bold gradient-text mb-2">
                    {quizScore}/{quizQuestions.length}
                  </div>
                  <p className="text-slate-400 mb-1">
                    {Math.round((quizScore / quizQuestions.length) * 100)}% correct
                  </p>
                  <p className="text-slate-300 text-sm mb-6">
                    {quizScore / quizQuestions.length >= 0.8
                      ? "Excellent work! You have a strong grasp of the material."
                      : quizScore / quizQuestions.length >= 0.6
                      ? "Good effort! Review the questions you missed and try again."
                      : "Keep studying! Review your notes and retake the quiz to improve."}
                  </p>

                  <div className="flex gap-3 justify-center flex-wrap">
                    <button onClick={generateQuiz} className="btn-primary flex items-center gap-2">
                      🔄 Retake Quiz
                    </button>
                    <button onClick={resetQuiz} className="btn-secondary flex items-center gap-2">
                      📝 New Quiz
                    </button>
                    <button onClick={() => setActiveTab("chat")} className="btn-secondary flex items-center gap-2">
                      💬 Ask AI About Mistakes
                    </button>
                  </div>
                </div>

                {/* Question review */}
                <div className="card p-6">
                  <h3 className="text-white font-bold mb-4">Question Review</h3>
                  <div className="space-y-3">
                    {quizQuestions.map((q, i) => {
                      const isCorrect = selectedAnswers[i] === q.correctIndex;
                      return (
                        <div key={i} className={`p-4 rounded-xl border ${isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                          <div className="flex items-start gap-3">
                            <span className={`text-lg flex-shrink-0 ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                              {isCorrect ? "✓" : "✗"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium mb-1">{q.question}</p>
                              {!isCorrect && (
                                <p className="text-slate-400 text-xs">
                                  Correct answer: <span className="text-emerald-400">{q.options[q.correctIndex]}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
