"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface ProfileData {
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  avatar?: string;
  bio?: string;
  institution?: string;
  phone?: string;
  location?: string;
}

function getInitialProfile(): ProfileData | null {
  if (typeof window === "undefined") return null;
  
  try {
    const savedProfile = localStorage.getItem("edumind_profile");
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    
    const defaultProfile = localStorage.getItem("edumind_user");
    if (defaultProfile) {
      const user = JSON.parse(defaultProfile);
      return {
        name: user.name || "John Doe",
        email: user.email || "john@example.com",
        role: user.role || "student",
        bio: "",
        institution: "",
        phone: "",
        location: "",
      };
    }
  } catch {
    // Ignore errors
  }
  
  return {
    name: "John Doe",
    email: "john@example.com",
    role: "student",
    bio: "Passionate learner",
    institution: "EduMind University",
    phone: "+1 234 567 8900",
    location: "New York, USA",
  };
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    institution: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    const loadedProfile = getInitialProfile();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(loadedProfile);
    if (loadedProfile) {
      setFormData({
        name: loadedProfile.name || "",
        bio: loadedProfile.bio || "",
        institution: loadedProfile.institution || "",
        phone: loadedProfile.phone || "",
        location: loadedProfile.location || "",
      });
    }
    setMounted(true);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setProfile((prev) => {
        const updated = prev ? { ...prev, avatar: base64 } : null;
        if (updated) {
          localStorage.setItem("edumind_profile", JSON.stringify(updated));
        }
        return updated;
      });
      setMessage({ type: "success", text: "Profile image updated!" });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedProfile: ProfileData = {
      ...profile!,
      name: formData.name,
      bio: formData.bio,
      institution: formData.institution,
      phone: formData.phone,
      location: formData.location,
    };

    setProfile(updatedProfile);
    localStorage.setItem("edumind_profile", JSON.stringify(updatedProfile));
    
    setSaving(false);
    setEditMode(false);
    setMessage({ type: "success", text: "Profile updated successfully!" });
  };

  const roleColors = {
    student: "from-indigo-500 to-cyan-500",
    teacher: "from-emerald-500 to-teal-500",
    admin: "from-orange-500 to-red-500",
  };

  const roleLabels = {
    student: "Student",
    teacher: "Teacher",
    admin: "Admin",
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-3 md:px-4">
        {/* Back Button */}
        <Link href="/dashboard/student" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 md:mb-6 text-sm md:text-base">
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="card p-4 md:p-6 text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-3 md:mb-4">
                {profile?.avatar ? (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-slate-700 mx-auto">
                    <Image
                      src={profile.avatar}
                      alt={profile.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br ${roleColors[profile?.role || "student"]} flex items-center justify-center text-white text-3xl md:text-4xl font-bold border-4 border-slate-700 mx-auto`}>
                    {profile?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                {/* Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 w-9 h-9 md:w-10 md:h-10 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                  title="Change profile picture"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <h2 className="text-lg md:text-xl font-bold text-white mb-1">{profile?.name}</h2>
              <p className="text-slate-400 text-sm mb-3">{profile?.email}</p>
              <span className={`badge badge-info`}>{roleLabels[profile?.role || "student"]}</span>

              {profile?.bio && (
                <p className="text-slate-400 text-sm mt-3 md:mt-4 italic">{profile.bio}</p>
              )}
            </div>

            {/* Quick Info */}
            <div className="card p-3 md:p-4 mt-3 md:mt-4">
              <h3 className="text-xs md:text-sm font-semibold text-slate-400 mb-2 md:mb-3">Quick Info</h3>
              <div className="space-y-2 md:space-y-3">
                {profile?.institution && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-slate-300 truncate">{profile.institution}</span>
                  </div>
                )}
                {profile?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-slate-300 truncate">{profile.phone}</span>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-slate-300 truncate">{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="md:col-span-2">
            <div className="card p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-white">Profile Settings</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="btn-secondary text-sm py-2 px-4 w-full sm:w-auto"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  message.type === "success" 
                    ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}>
                  {message.text}
                </div>
              )}

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field w-full p-3 md:p-2"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-white">{profile?.name}</p>
                  )}
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <p className="text-slate-400">{profile?.email}</p>
                </div>

                {/* Role (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Account Type
                  </label>
                  <p className="text-slate-400 capitalize">{profile?.role}</p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bio
                  </label>
                  {editMode ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="input-field w-full h-28 md:h-24 resize-none p-3 md:p-2"
                      placeholder="Tell us about yourself"
                    />
                  ) : (
                    <p className="text-slate-300">{profile?.bio || "No bio added yet"}</p>
                  )}
                </div>

                {/* Institution */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Institution
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="input-field w-full p-3 md:p-2"
                      placeholder="Your school or university"
                    />
                  ) : (
                    <p className="text-slate-300">{profile?.institution || "Not specified"}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field w-full p-3 md:p-2"
                      placeholder="+1 234 567 8900"
                    />
                  ) : (
                    <p className="text-slate-300">{profile?.phone || "Not specified"}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input-field w-full p-3 md:p-2"
                      placeholder="City, Country"
                    />
                  ) : (
                    <p className="text-slate-300">{profile?.location || "Not specified"}</p>
                  )}
                </div>

                {/* Action Buttons */}
                {editMode && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary py-2.5 md:py-2 px-6 w-full sm:w-auto text-base md:text-sm"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          name: profile?.name || "",
                          bio: profile?.bio || "",
                          institution: profile?.institution || "",
                          phone: profile?.phone || "",
                          location: profile?.location || "",
                        });
                      }}
                      className="btn-secondary py-2.5 md:py-2 px-6 w-full sm:w-auto text-base md:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
