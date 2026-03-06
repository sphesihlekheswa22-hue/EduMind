"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import NotificationBell from '@/components/NotificationBell';

interface Course {
  id: number;
  title: string;
  description: string;
  subject: string;
  courseCode: string;
  teacherId: string;
  teacherName: string;
  thumbnail: string;
  enrollmentCount: number;
  enrollmentStatus?: string;
  createdAt: string;
}

export default function BrowseCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [enrolling, setEnrolling] = useState<number | null>(null);

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Art', 'Music', 'Physics', 'Chemistry', 'Biology'];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchCourses();
    } else if (user) {
      router.push('/dashboard/' + user.role);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [searchTerm, subjectFilter]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (!data.user) {
        router.push('/login');
        return;
      }
      setUser(data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (subjectFilter) params.set('subject', subjectFilter);

      const res = await fetch(`/api/courses?${params}`);
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    setEnrolling(courseId);
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      
      if (res.ok) {
        alert('Enrollment request submitted successfully!');
        fetchCourses(); // Refresh to show updated status
      } else {
        alert(data.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll');
    } finally {
      setEnrolling(null);
    }
  };

  if (!user || user.role !== 'student') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <DashboardSidebar 
        role={user.role as 'student'} 
        userName={user.name}
        userEmail={user.email}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-xl font-semibold text-white hidden lg:block">Browse Courses</h1>
          
          <div className="flex items-center gap-4">
            <NotificationBell userId={user.id} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Filters */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-slate-400 text-lg">No courses found</p>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all">
                  {/* Thumbnail */}
                  <div className="h-40 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center">
                    <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-400">
                        {course.subject}
                      </span>
                      {course.courseCode && (
                        <span className="text-xs text-slate-500">{course.courseCode}</span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description || 'No description available'}</p>

                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      <span>By {course.teacherName}</span>
                      <span>{course.enrollmentCount} enrolled</span>
                    </div>

                    {/* Enrollment Status / Button */}
                    {course.enrollmentStatus === 'approved' ? (
                      <button
                        onClick={() => router.push(`/courses/${course.id}/materials`)}
                        className="w-full py-2 bg-green-500/20 text-green-400 rounded-lg font-medium hover:bg-green-500/30 transition-colors"
                      >
                        View Course
                      </button>
                    ) : course.enrollmentStatus === 'pending' ? (
                      <button
                        disabled
                        className="w-full py-2 bg-yellow-500/20 text-yellow-400 rounded-lg font-medium cursor-not-allowed"
                      >
                        Request Pending
                      </button>
                    ) : course.enrollmentStatus === 'rejected' ? (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrolling === course.id}
                        className="w-full py-2 bg-slate-700 text-slate-400 rounded-lg font-medium hover:bg-slate-600 transition-colors"
                      >
                        {enrolling === course.id ? 'Enrolling...' : 'Request Again'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrolling === course.id}
                        className="w-full py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
                      >
                        {enrolling === course.id ? 'Enrolling...' : 'Request Enrollment'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
