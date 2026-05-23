/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, BarChart3, LogOut, Code, GraduationCap, User, Terminal, ChevronDown, Moon, Sun, X } from 'lucide-react';
import { Course } from '../types';
import { useState, useRef, useEffect } from 'react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  user: { name: string; email: string; avatar?: string; enrolledCourses?: string[]; currentCourseId?: string | null } | null;
  onLogout: () => void;
  coursesList: Course[];
  activeCourseId: string | null;
  onCourseChange: (courseId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  currentTab,
  setTab,
  user,
  onLogout,
  coursesList,
  activeCourseId,
  onCourseChange,
  isOpen,
  onClose,
}: SidebarProps) {
  const menuItems = [
    { id: 'learn', label: 'Apprendre', icon: BookOpen },
    ...(activeCourseId ? [{ id: 'compiler', label: 'Compilateur Sandbox', icon: Terminal }] : []),
    { id: 'projects', label: 'Projets', icon: Code },
    { id: 'progress', label: 'Progression', icon: BarChart3 },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const isNowDark = document.documentElement.classList.toggle('dark');
    setIsDark(isNowDark);
    localStorage.setItem('theme', isNowDark ? 'dark' : 'light');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const enrolledCourses = coursesList.filter((c) => user?.enrolledCourses?.includes(c.id));
  const activeCourse = enrolledCourses.find((c) => c.id === activeCourseId);

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        id="sidebar-nav" 
        className={`
          w-64 bg-sidebar border-r border-[#1E293B] flex flex-col h-screen fixed md:sticky top-0 z-50 shrink-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1E293B] flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#58CC02] flex items-center justify-center text-white border border-[#58CC02]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg tracking-tight text-white">LearnCraft</h1>
            </div>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

      {/* Course Switcher in Sidebar (only shown if a course is currently active) */}
      {activeCourseId && coursesList.length > 0 && (
        <div className="px-6 pt-5 pb-2" ref={dropdownRef}>
          <label className="text-[10px] font-mono font-bold text-[#5c687e] uppercase tracking-wider block mb-2">Sélecteur de parcours de cours</label>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full bg-sidebar-panel border ${isDropdownOpen ? 'border-[#58CC02] ring-1 ring-[#58CC02]' : 'border-slate-700'} text-slate-200 text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:border-[#58CC02] transition-all cursor-pointer flex justify-between items-center`}
            >
              <span className="truncate">{activeCourse?.title || "Sélectionner un cours"}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-sidebar-panel border border-slate-700 rounded-lg overflow-hidden shadow-lg z-50">
                {enrolledCourses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onCourseChange(c.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                      activeCourseId === c.id
                        ? 'bg-[#1d4ed8] text-white'
                        : 'text-slate-200 hover:bg-[#1d4ed8] hover:text-white'
                    }`}
                  >
                    {c.title}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setTab('new-course');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-xs font-bold text-[#58CC02] hover:bg-[#58CC02]/10 transition-colors cursor-pointer"
                >
                  + Rejoindre un nouveau cours
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              id={`sidebar-link-${item.id}`}
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-colors duration-200 text-left font-medium text-sm group ${
                isActive
                  ? 'bg-[#58CC02] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-sidebar-panel'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Session profile */}
      {user && (
        <div className="p-4 border-t border-sidebar-panel bg-sidebar">
          {/* Theme Toggle */}
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-xs font-semibold text-slate-400">Mode sombre</span>
            <button
              onClick={toggleTheme}
              className={`w-10 h-5 rounded-full relative flex items-center transition-colors p-0.5 cursor-pointer ${isDark ? 'bg-sidebar-panel border border-slate-700' : 'bg-slate-300 border border-slate-400'}`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-transform ${isDark ? 'translate-x-5 bg-[#58CC02]' : 'translate-x-0 bg-white shadow-sm'}`}>
                {isDark ? <Moon className="w-2.5 h-2.5 text-white" /> : <Sun className="w-2.5 h-2.5 text-slate-400" />}
              </div>
            </button>
          </div>

          <button
            onClick={() => setTab('profile')}
            className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl border transition-all mb-3 cursor-pointer group ${
              currentTab === 'profile'
                ? 'bg-[#58CC02]/15 border-[#58CC02]/30'
                : 'bg-sidebar-panel border-sidebar-panel hover:bg-slate-700/50 hover:border-slate-700'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base transition-colors duration-200 shrink-0 ${
              currentTab === 'profile'
                ? 'bg-[#58CC02] text-white'
                : 'bg-[#58CC02]/20 border border-[#58CC02]/30 text-[#58CC02] group-hover:bg-[#58CC02] group-hover:text-white'
            }`}>
              {user.avatar || user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate transition-colors ${
                currentTab === 'profile' ? 'text-[#58CC02]' : 'text-slate-300 group-hover:text-[#58CC02]'
              }`}>{user.name}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
            </div>
          </button>
          <button
            id="logout-button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2 bg-sidebar-panel hover:bg-rose-600 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer border border-sidebar-panel"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </aside>
    </>
  );
}
