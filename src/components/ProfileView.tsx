/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Github, BookOpen, Award, Code, CheckCircle, Clock, Save, 
  X, Edit2, Calendar, Trophy, ChevronRight, MessageSquare, History, Bookmark, Sparkles, Trash2
} from 'lucide-react';
import api from '../api';
import { Course, UserStats } from '../types';
import CourseIcon from './CourseIcon';

interface ProfileViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
    avatar?: string;
    bio?: string;
    github?: string;
    streak?: number;
  };
  coursesList: Course[];
  onProfileUpdate: (updatedUser: any) => void;
}

const AVATAR_PRESETS = [
  { emoji: '⚡', label: 'Arc Énergétique', bg: 'bg-amber-100 border-amber-300' },
  { emoji: '🧠', label: 'Neuro-Architecte', bg: 'bg-indigo-100 border-indigo-300' },
  { emoji: '💻', label: 'Hacker du Noyau', bg: 'bg-emerald-100 border-emerald-300' },
  { emoji: '🚀', label: 'Cadet de l\'Espace', bg: 'bg-rose-100 border-rose-300' },
  { emoji: '🎨', label: 'Tisseur d\'Interfaces', bg: 'bg-fuchsia-100 border-fuchsia-300' },
  { emoji: '☕', label: 'Thread Caféine', bg: 'bg-yellow-100 border-yellow-300' },
  { emoji: '🦊', label: 'Renard Agile', bg: 'bg-orange-100 border-orange-300' },
  { emoji: '🦉', label: 'Compilateur Sage', bg: 'bg-violet-100 border-violet-300' },
  { emoji: '🐼', label: 'Panda Binaire', bg: 'bg-cyan-100 border-cyan-300' }
];

export default function ProfileView({ user, coursesList, onProfileUpdate }: ProfileViewProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [courseProgresses, setCourseProgresses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  // Unenrollment state
  const [unenrollCourse, setUnenrollCourse] = useState<Course | null>(null);
  const [unenrolling, setUnenrolling] = useState(false);
  
  // Editing profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio || "Fullstack Engineer & Lifelong Learner.");
  const [editAvatar, setEditAvatar] = useState(user.avatar || '⚡');
  const [editGithub, setEditGithub] = useState(user.github || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfileMetrics() {
      setLoading(true);
      try {
        const [userStats, certList, projectSubs] = await Promise.all([
          api.getStats(),
          api.getCertificates(),
          api.getSubmissions()
        ]);
        
        setStats(userStats);
        setCertificates(certList);
        setSubmissions(projectSubs);

        // Fetch detailed completion rate for each course path
        const progresses: Record<string, number> = {};
        for (const course of coursesList) {
          const detail = await api.getCourseDetails(course.id);
          const progMap = await api.getProgress(course.id);
          const total = detail.chapters.reduce((sum: number, ch: any) => sum + (ch.items?.length || 0), 0);
          const completed = detail.chapters.reduce(
            (sum: number, ch: any) => sum + (ch.items?.filter((it: any) => progMap[it.id]?.completed).length || 0), 0
          );
          progresses[course.id] = total > 0 ? Math.round((completed / total) * 100) : 0;
        }
        setCourseProgresses(progresses);
      } catch (err) {
        console.error("Error loading user profile details", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfileMetrics();
  }, [coursesList, user.id]);

  useEffect(() => {
    const ctx = {
      tab: 'profile',
      viewingProfile: true,
      userName: user.name,
      userBio: user.bio,
      userGithub: user.github,
      certificatesCount: certificates.length,
      submissionsCount: submissions.length,
      stats: stats ? {
        chaptersDone: stats.chaptersDone,
        totalChapters: stats.totalChapters,
        projectsBuilt: stats.projectsBuilt,
        percentComplete: stats.percentComplete,
        timeSpentMinutes: stats.timeSpentMinutes,
        streak: stats.streak
      } : null
    };
    window.dispatchEvent(new CustomEvent('learncraft-context-change', { detail: ctx }));
  }, [user, certificates, submissions, stats]);

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const updated = await api.updateProfile(editName, editBio, editAvatar, editGithub);
      onProfileUpdate(updated);
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to update profile", e);
    } finally {
      setSaving(false);
    }
  };

  const handleUnenroll = async () => {
    if (!unenrollCourse) return;
    setUnenrolling(true);
    try {
      await api.unenrollCourse(unenrollCourse.id);
      setUnenrollCourse(null);
      // We should probably trigger a refresh. If top-level App manages coursesList, this won't be enough.
      // But let's assume onProfileUpdate or a signal will handle refresh or it will just work via state update.
      // Wait, coursesList is props. I might need a callback onUnenroll.
      // I don't see onUnenroll in ProfileViewProps.
      // Let's reload profile data to be safe.
      window.location.reload(); 
    } catch (e) {
      console.error("Failed to unenroll", e);
    } finally {
      setUnenrolling(false);
    }
  };


  // Compute stats metrics
  const activeStreak = stats?.streak !== undefined ? stats.streak : (user.streak !== undefined ? user.streak : 1);
  const completedProjectsCount = submissions.filter(s => s.status === 'reviewed').length;
  const certificatesCount = certificates.filter(c => c.unlocked).length;

  // Synthesize timeline items
  const activityTimeline = [
    {
      id: 'act-1',
      type: 'enroll',
      title: 'Compte Système Initialisé',
      description: 'Clés de développeur signées et rattachées au bac à sable LearnCraft.',
      time: user.joinedAt ? new Date(user.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '22 mai 2026',
      icon: User,
      color: 'text-indigo-600 bg-indigo-55/10 border-indigo-200'
    }
  ];

  if (submissions.length > 0) {
    submissions.forEach((sub, i) => {
      activityTimeline.push({
        id: `act-sub-${i}`,
        type: 'project',
        title: `Projet Compilé : ${sub.itemTitle}`,
        description: sub.status === 'reviewed' 
          ? `Code du module évalué. Révision complétée: "${sub.feedback || 'Excellente architecture'}"`
          : 'Fichiers interactifs soumis pour révision de conformité.',
        time: new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        icon: Code,
        color: sub.status === 'reviewed' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-amber-650 bg-amber-50 border-amber-200'
      });
    });
  }

  // Create achievement credentials list
  const achievements = [
    {
      id: 'ach-onboard',
      title: 'Dév Intégré',
      description: 'Autorisation accordée avec succès au sein de l\'espace de travail.',
      icon: Sparkles,
      unlocked: true,
      reward: '15 EXP'
    },
    {
      id: 'ach-first',
      title: 'Première Quête',
      description: 'A validé avec succès un premier module d\'apprentissage.',
      icon: CheckCircle,
      unlocked: stats ? stats.percentComplete > 0 : false,
      reward: '50 EXP'
    },
    {
      id: 'ach-chapter',
      title: 'Architecte en Chef',
      description: 'A maîtrisé intégralement le cursus d\'au moins un chapitre complet.',
      icon: BookOpen,
      unlocked: stats ? stats.chaptersDone > 0 : false,
      reward: '150 EXP'
    },
    {
      id: 'ach-project',
      title: 'Bâtisseur du Bac à Sable',
      description: 'A soumis un projet de niveau avancé pour relecture par ses pairs.',
      icon: Code,
      unlocked: submissions.length > 0,
      reward: '250 EXP'
    },
    {
      id: 'ach-master',
      title: 'Gourou du code',
      description: 'Maîtrise complète et à 100% sur un parcours de cours supérieur.',
      icon: Trophy,
      unlocked: Object.values(courseProgresses).some(pct => pct === 100),
      reward: 'Badge Élite'
    }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#58CC02]/20 border-t-[#58CC02] animate-spin"></div>
          <p className="text-content-muted text-sm font-medium">Cartographie des profils de développeurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-base text-content">
      {/* High-Impact Profile Header Banner */}
      <div className="relative pt-12 pb-8 px-10 border-b border-divider bg-panel overflow-hidden shadow-sm">
        {/* Subtle grid accent background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#58CC02]/10 blur-3xl rounded-full translate-x-40 -translate-y-40 select-none pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center gap-8 z-10">
          {/* Avatar Ring */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-3xl bg-sidebar-panel border-4 border-white shadow-md flex items-center justify-center text-5xl relative">
              {user.avatar || '⚡'}
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute -bottom-2 -right-2 bg-[#58CC02] hover:bg-[#46A302] text-white p-2 rounded-xl shadow-lg border-2 border-white transition-all cursor-pointer opacity-0 group-hover:opacity-100 duration-200"
                title="Edit Profile"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Identity details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center md:justify-start">
              <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight">{user.name}</h2>
              {user.github && (
                <a 
                  href={`https://github.com/${user.github}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-divider self-center"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>{user.github}</span>
                </a>
              )}
            </div>
            
            <p className="text-sm text-content-muted mt-2 max-w-2xl font-normal leading-relaxed">
              {user.bio || "Ingénieur Fullstack & Apprenant passionné."}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 mt-4 text-content-muted text-xs font-medium font-mono">
              <div className="flex items-center gap-1.5 bg-panel-muted border border-divider px-3 py-1 rounded-lg">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-panel-muted border border-divider px-3 py-1 rounded-lg">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Inscrit le : {activityTimeline[0].time}</span>
              </div>
            </div>
          </div>

          {/* Edit Trigger Widget */}
          <div className="shrink-0">
            <button 
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 bg-[#58CC02]/10 hover:bg-[#58CC02] text-[#58CC02] hover:text-white font-bold text-sm rounded-xl transition-all border border-[#58CC02]/20 shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>Modifier l'identité du développeur</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main grids content split layout */}
      <div className="px-10 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: stats & certificate badges */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick numbers board in mini cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-panel border-2 border-divider rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] text-content-muted uppercase font-bold font-mono block">Assiduité académique</span>
              <span className="text-xl font-bold text-content mt-1.5 block flex items-center gap-1.5">
                🔥 {activeStreak} Jours
              </span>
            </div>
            <div className="bg-panel border-2 border-divider rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] text-content-muted uppercase font-bold font-mono block">Projets réalisés</span>
              <span className="text-xl font-bold text-content mt-1.5 block flex items-center gap-1.5">
                🚀 {submissions.length} Fichiers
              </span>
            </div>
            <div className="bg-panel border-2 border-divider rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] text-content-muted uppercase font-bold font-mono block">Diplômes débloqués</span>
              <span className="text-xl font-bold text-content mt-1.5 block flex items-center gap-1.5">
                🎓 {certificatesCount} Certificats
              </span>
            </div>
          </div>

          {/* Path progressions modules details */}
          <div className="bg-panel border-2 border-divider rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-4 border-b border-divider mb-5">
              <BookOpen className="w-4 h-4 text-[#58CC02]" />
              <span>Academic Curriculum Vectors</span>
            </h3>

            <div className="space-y-6">
              {coursesList.map(course => {
                const progressPct = courseProgresses[course.id] || 0;
                return (
                  <div key={course.id} className="group relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-panel-muted flex items-center justify-center shrink-0 border border-divider shadow-sm relative overflow-hidden text-xl select-none">
                          <CourseIcon course={course} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#58CC02] transition-colors">{course.title}</h4>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{course.duration} • {course.difficulty}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 font-mono">
                        <button
                          onClick={() => setUnenrollCourse(course)}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg transition-colors cursor-pointer"
                          title="Se désinscrire"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          progressPct === 100 
                            ? 'text-emerald-700 bg-emerald-100 border border-emerald-200' 
                            : progressPct > 0 
                            ? 'text-sky-700 bg-sky-100 border border-sky-200' 
                            : 'text-slate-600 bg-slate-100 border border-divider'
                        }`}>
                          {progressPct === 100 ? 'Diplômé' : progressPct > 0 ? 'Étude active' : 'Inscrit'}
                        </span>
                        <span className="text-xs font-bold text-content">{progressPct}%</span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          progressPct === 100 ? 'bg-emerald-505' : 'bg-[#58CC02]'
                        }`}
                        style={{ width: `${progressPct}%`, backgroundColor: progressPct === 100 ? '#10B981' : '#58CC02' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Projects showcase catalog */}
          <div className="bg-panel border-2 border-divider rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-4 border-b border-divider mb-5">
              <Code className="w-4 h-4 text-emerald-500" />
              <span>Soumissions de projets Sandbox</span>
            </h3>

            {submissions.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <Code className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs text-content-muted">Vous n'avez pas encore soumis de fichiers de projet pour ce module.</p>
                <span className="text-[10px] text-slate-400 mt-1 block">Consultez les chapitres du cours et soumettez vos projets.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => {
                  const course = coursesList.find(c => c.id === sub.courseId);
                  return (
                    <div key={sub.id} className="border border-divider rounded-xl p-4 bg-panel-muted/50 hover:bg-panel-muted transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">{sub.itemTitle}</h4>
                          <span className="text-[10px] text-content-muted font-mono mt-0.5 block">Parcours d'étude : {course?.title || sub.courseId}</span>
                        </div>
                        <span className={`text-[10px] font-bold font-mono tracking-wide uppercase px-2.5 py-0.5 rounded-md border ${
                          sub.status === 'reviewed' 
                            ? 'text-emerald-700 bg-emerald-100/50 border-emerald-300' 
                            : 'text-amber-700 bg-amber-100/50 border-amber-300'
                        }`}>
                          {sub.status === 'reviewed' ? '● Révisé & Approuvé Sandbox' : '⏳ En attente de validation CI'}
                        </span>
                      </div>

                      {/* Display Markdown/Mock files snippet code format */}
                      <div className="bg-sidebar-panel text-slate-300 p-3 rounded-lg font-mono text-[11px] overflow-x-auto select-all max-h-36 shadow-inner border border-slate-800">
                        <pre>{sub.submissionText || '// Conteneur de contenu vide'}</pre>
                      </div>

                      {sub.feedback && (
                        <div className="mt-3 bg-teal-50 border border-teal-200 p-3 rounded-lg text-xs">
                          <strong className="text-teal-900 block font-bold mb-1">Note d\'évaluation sandbox :</strong>
                          <span className="text-teal-800 italic">"{sub.feedback}"</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: activity timeline & achievement logs */}
        <div className="space-y-8">
          
          {/* Unlocked Credentials Cert Board */}
          <div className="bg-panel border-2 border-divider rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-4 border-b border-divider mb-5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Diplômes et certifications</span>
            </h3>

            {certificates.filter(c => c.unlocked).length === 0 ? (
              <div className="py-6 text-center select-none">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-content">Aucun diplôme débloqué</p>
                <p className="text-[10px] text-content-muted mt-1 max-w-[200px] mx-auto leading-relaxed">
                  Atteignez 100% de progression dans n'importe quel parcours d'étude pour générer un certificat cryptographiquement signé.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {certificates.filter(c => c.unlocked).map((cert, idx) => (
                  <div key={cert.courseId || idx} className="relative border-2 border-amber-100 bg-amber-50/20 p-4 rounded-xl shadow-inner text-center overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-205/10 blur-xl rounded-full" />
                    
                    <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-content leading-tight px-1">{cert.title || 'Certificat de Maîtrise'}</h4>
                    <span className="text-[9px] font-mono text-amber-700 block mt-0.5">{cert.subtitle || 'Diplômé d\'ingénierie LearnCraft'}</span>
                    
                    <div className="mt-3.5 pt-2 border-t border-amber-100/60 flex items-center justify-between text-[8px] text-content-muted uppercase font-mono tracking-wider font-semibold">
                      <span>SEC_KEY: hash_{cert.courseId?.slice(0, 4)}</span>
                      <span className="text-emerald-700 font-bold">Identité Authentifiée ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievement Medals Grid */}
          <div className="bg-panel border-2 border-divider rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-4 border-b border-divider mb-5">
              <Trophy className="w-4 h-4 text-purple-600" />
              <span>Badges d'ingénierie obtenus</span>
            </h3>

            <div className="space-y-4">
              {achievements.map((ach) => {
                const Icon = ach.icon;
                return (
                  <div 
                    key={ach.id} 
                    className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all ${
                      ach.unlocked 
                        ? 'bg-purple-50/20 border-purple-100 shadow-sm' 
                        : 'bg-panel-muted border-slate-100 opacity-60 saturate-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      ach.unlocked 
                        ? 'bg-purple-100/50 border-purple-200 text-purple-600' 
                        : 'bg-slate-100 border-divider text-slate-400'
                    }`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-bold ${ach.unlocked ? 'text-gray-900' : 'text-slate-400'}`}>
                          {ach.title}
                        </h4>
                        {ach.unlocked && (
                          <span className="text-[8px] font-bold font-mono text-purple-700 bg-purple-100 border border-purple-200 px-1.5 py-0.5 rounded-full uppercase">
                            {ach.reward}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-content-muted mt-0.5 leading-relaxed">{ach.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activities log timeline */}
          <div className="bg-panel border-2 border-divider rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-4 border-b border-divider mb-5">
              <History className="w-4 h-4 text-blue-500" />
              <span>Sandbox Action Logs</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E7EB]">
              {activityTimeline.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="relative">
                    <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-md border flex items-center justify-center ${item.color} shrink-0`}>
                      <Icon className="w-3 h-3" />
                    </span>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-gray-900 leading-snug">{item.title}</h4>
                        <span className="text-[9px] text-content-muted font-mono whitespace-nowrap">{item.time}</span>
                      </div>
                      <p className="text-[10px] text-content-muted mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Editing Profile Screen AnimatePresence Popups Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop cover overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-sidebar/60 backdrop-blur-sm"
            />

            {/* Editing Dialog Modal container */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg bg-panel border border-divider rounded-3xl p-6 shadow-2xl overflow-hidden text-left"
            >
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-base font-display font-bold text-gray-900 tracking-tight">Modify Sandbox Identity</h3>
                <p className="text-xs text-content-muted mt-0.5">Define your display keys and choose workspace avatar modules.</p>
              </div>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-content-muted font-mono tracking-wider block mb-1.5">User Handle Name</label>
                  <input 
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-panel-muted border-2 border-divider rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#58CC02] focus:bg-panel transition-all"
                    placeholder="E.g. Alexis Forge"
                  />
                </div>

                {/* GitHub */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-content-muted font-mono tracking-wider block mb-1.5">Github Profile Key</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono select-none">github.com/</span>
                    <input 
                      type="text"
                      value={editGithub}
                      onChange={(e) => setEditGithub(e.target.value)}
                      className="w-full bg-panel-muted border-2 border-divider rounded-xl pl-[96px] pr-4 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#58CC02] focus:bg-panel transition-all font-mono"
                      placeholder="alex-forge"
                    />
                  </div>
                </div>

                {/* Bio text area */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-content-muted font-mono tracking-wider block mb-1.5">Executive Summary Bio</label>
                  <textarea 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    className="w-full bg-panel-muted border-2 border-divider rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#58CC02] focus:bg-panel transition-all leading-relaxed"
                    placeholder="Summarize your engineering expertise milestones here."
                  />
                </div>

                {/* Avatar emojis presets selector */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-content-muted font-mono tracking-wider block mb-2.5">Avatar Symbol Preset</label>
                  <div className="grid grid-cols-5 gap-2.5">
                    {AVATAR_PRESETS.map((p) => (
                      <button
                        key={p.emoji}
                        type="button"
                        onClick={() => setEditAvatar(p.emoji)}
                        className={`p-3 rounded-2xl border-2 text-2xl flex items-center justify-center transition-all cursor-pointer select-none relative ${
                          editAvatar === p.emoji 
                            ? 'border-[#58CC02] bg-[#58CC02]/5 scale-102 ring-2 ring-[#58CC02]/20' 
                            : 'border-slate-100 bg-panel-muted hover:bg-slate-100 hover:border-divider'
                        }`}
                        title={p.label}
                      >
                        <span>{p.emoji}</span>
                        {editAvatar === p.emoji && (
                          <div className="absolute -top-1 -right-1 bg-[#58CC02] text-white rounded-full p-0.5 shadow-sm border border-white">
                            <svg className="w-1.5 h-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Edit Buttons Modal actions */}
              <div className="mt-8 flex items-center justify-end gap-3.5 border-t border-slate-100 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  disabled={saving || !editName.trim()}
                  onClick={handleSaveProfile}
                  className="px-6 py-2.5 bg-[#58CC02] hover:bg-[#46A302] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Synchronizing...' : 'Save credentials'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Unenroll Confirmation Modal */}
      <AnimatePresence>
        {unenrollCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUnenrollCourse(null)}
              className="absolute inset-0 bg-sidebar/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-sm bg-panel border border-divider rounded-3xl p-6 shadow-2xl text-center"
            >
              <div className="w-12 h-12 bg-rose-100/50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Se désinscrire ?</h3>
              <p className="text-xs text-content-muted mt-2 mb-6 leading-relaxed">
                Êtes-vous sûr de vouloir quitter le cours <span className="font-bold text-gray-900">{unenrollCourse.title}</span> ? 
                Toutes vos progressions, badges et fichiers soumis seront définitivement effacés de votre historique utilisateur.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setUnenrollCourse(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleUnenroll}
                  disabled={unenrolling}
                  className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {unenrolling ? 'Désinscription...' : 'Confirmer le départ'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
