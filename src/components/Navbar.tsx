"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Check if user is logged in
    try {
      const profile = localStorage.getItem("edumind_profile");
      const user = localStorage.getItem("edumind_user");
      
      if (profile) {
        const parsed = JSON.parse(profile);
        setIsLoggedIn(true);
        setUserName(parsed.name || "User");
        setUserAvatar(parsed.avatar || null);
      } else if (user) {
        const parsed = JSON.parse(user);
        setIsLoggedIn(true);
        setUserName(parsed.name || "User");
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                E
              </div>
              <span className="font-bold text-lg text-white">
                EduMind <span className="gradient-text">AI</span>
              </span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              E
            </div>
            <span className="font-bold text-lg text-white">
              EduMind <span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-slate-400 hover:text-white text-sm transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-slate-400 hover:text-white text-sm transition-colors">
              How It Works
            </Link>
            <Link href="/#pricing" className="text-slate-400 hover:text-white text-sm transition-colors">
              Pricing
            </Link>
          </div>

          {/* CTA Buttons / Profile Icon */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/profile" className="flex items-center gap-2 group" title="View Profile">
                {userAvatar ? (
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-600 group-hover:border-indigo-500 transition-colors">
                    <Image 
                      src={userAvatar} 
                      alt={userName}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm group-hover:ring-2 ring-indigo-500/50 transition-all">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                  Log In
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 flex flex-col gap-3">
            <Link href="/#features" className="text-slate-400 hover:text-white text-sm py-2">Features</Link>
            <Link href="/#how-it-works" className="text-slate-400 hover:text-white text-sm py-2">How It Works</Link>
            <Link href="/#pricing" className="text-slate-400 hover:text-white text-sm py-2">Pricing</Link>
            <div className="flex flex-col gap-2 pt-2">
              {isLoggedIn ? (
                <Link href="/profile" className="flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                  {userAvatar ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <Image 
                        src={userAvatar} 
                        alt={userName}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium">My Profile</span>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary text-sm text-center">Log In</Link>
                  <Link href="/register" className="btn-primary text-sm text-center">Get Started Free</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
