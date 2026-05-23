import { useState, useEffect } from 'react';
import { Flame, CheckSquare, Laptop, GraduationCap } from 'lucide-react';
import api from '../api';
import { Course } from '../types';

export default function ProgressView() {
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  
  // Stats
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [projectsCompleted, setProjectsCompleted] = useState(0);
  
  // Active course chapters & progress map
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  useEffect(() => {
    async function loadProgressStats() {
      setLoading(true);
      try {
        // Fetch user info for active course and streak
        const user = await api.getMe();
        
        // Streak → users/{userId}.streak
        const userStreak = user?.streak !== undefined ? user.streak : 0;
        setStreak(userStreak);

        // Fetch all courses
        const courses = await api.getCourses();
        const activeId = user?.currentCourseId || 'py-basic';
        const selected = courses.find(c => c.id === activeId) || courses[0];
        
        if (selected) {
          setActiveCourse(selected);
          
          // Fetch chapters and items for active course
          const courseData = await api.getCourseLearn(selected.id);
          if (courseData && courseData.chapters) {
            setChapters(courseData.chapters);
          }

          // Fetch user's progress document matching progress/{userId}_{courseId}
          const progressDoc = await api.getProgressDoc(selected.id);
          const completedIds = progressDoc?.completedItems || [];
          setCompletedItems(completedIds);

          // Lessons completed → count of completedItems in progress/{userId}_{courseId}
          setLessonsCompleted(completedIds.length);

          // Projects submitted → progress/{userId}_{courseId}.projectsBuilt
          const projBuilt = progressDoc?.projectsBuilt !== undefined ? progressDoc.projectsBuilt : 0;
          setProjectsCompleted(projBuilt);
        }
      } catch (err) {
        console.error('Error loading progress stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProgressStats();
  }, []);

  useEffect(() => {
    if (activeCourse) {
      const ctx = {
        tab: 'progress',
        viewingProgress: true,
        streak,
        lessonsCompleted,
        projectsCompleted,
        courseTitle: activeCourse.title
      };
      window.dispatchEvent(new CustomEvent('learncraft-context-change', { detail: ctx }));
    }
  }, [activeCourse, streak, lessonsCompleted, projectsCompleted]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#58CC02]/20 border-t-[#58CC02] animate-spin"></div>
          <p className="text-content-muted text-sm font-medium font-mono">Synchronisation de l'état d'apprentissage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-10 bg-base text-content">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="select-none">
          <h2 className="text-xl font-display font-extrabold text-content tracking-tight">
            Mon Tableau de Bord de Progression
          </h2>
          <p className="text-xs text-content-muted mt-1 font-medium">
            Indicateurs d'étapes en temps réel et statistiques de vérification.
          </p>
        </div>

        {/* Minimalist Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Current Streak Card */}
          <div className="bg-panel border-2 border-divider rounded-2xl p-5 shadow-sm select-none">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6 fill-orange-500" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
                  Série d'Étude
                </span>
                <span className="text-lg font-extrabold text-content block mt-0.5">
                  {streak} Jours Actifs
                </span>
              </div>
            </div>
            {/* Weekly Calendar */}
            <div className="flex justify-between items-center gap-1 w-full">
              {Array.from({ length: 7 }).map((_, i) => {
                const dayIndex = 6 - i; // 0 is today, 6 is 6 days ago
                const isActive = streak > dayIndex;
                return (
                  <div key={i} className="flex flex-col items-center shrink">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${isActive ? 'bg-[#58CC02] border-[#58CC02] text-white' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                      <span className="text-[9px] sm:text-[10px] font-bold">{['D', 'L', 'M', 'M', 'J', 'V', 'S'][ (new Date().getDay() - dayIndex + 7) % 7 ]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lessons completed */}
          <div className="bg-panel border-2 border-divider rounded-2xl p-5 flex items-center gap-4 shadow-sm select-none">
            <div className="w-12 h-12 rounded-xl bg-[#58CC02]/10 border border-[#58CC02]/20 text-[#58CC02] flex items-center justify-center shrink-0">
              <CheckSquare className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
                Leçons Terminées
              </span>
              <span className="text-lg font-extrabold text-content block mt-0.5">
                {lessonsCompleted} Blocs Théoriques
              </span>
            </div>
          </div>

          {/* Projects Completed */}
          <div className="bg-panel border-2 border-divider rounded-2xl p-5 flex items-center gap-4 shadow-sm select-none">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
                Projets Soumis
              </span>
              <span className="text-lg font-extrabold text-content block mt-0.5">
                {projectsCompleted} Solutions de Labo
              </span>
            </div>
          </div>
        </div>

        {/* Active course focus outline chapters with progress percentage bar */}
        {activeCourse && (
          <div className="bg-panel border-2 border-divider rounded-2xl p-6.5 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 select-none flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#58CC02] font-mono font-bold uppercase tracking-wider">
                  Parcours d'Apprentissage Actif
                </span>
                <h3 className="text-base font-bold text-content mt-0.5">
                  {activeCourse.title}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-divider flex items-center justify-center text-slate-600">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>

            {/* Chapters layout */}
            <div className="space-y-5">
              {chapters.map((ch: any) => {
                const totalItems = ch.items?.length || 0;
                const completedItemsCount = ch.items?.filter((it: any) => completedItems.includes(it.id)).length || 0;
                const percentage = totalItems > 0 ? Math.round((completedItemsCount / totalItems) * 100) : 0;

                return (
                  <div key={ch.id} className="border border-divider p-4.5 rounded-xl space-y-3.5 bg-panel-muted">
                    <div className="flex justify-between items-start gap-4">
                      <div className="select-none">
                        <span className="text-[9px] font-mono text-[#58CC02] font-semibold uppercase tracking-wider">
                          Chapitre {ch.chapterNumber}
                        </span>
                        <h4 className="text-xs font-bold text-content mt-0.5">
                          {ch.title}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-extrabold text-[#58CC02] mt-0.5 shrink-0 select-none">
                        {percentage}% Terminé
                      </span>
                    </div>

                    {/* Progress Slider Track */}
                    <div className="space-y-1.5 select-none">
                      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                        <div
                          className="h-full bg-[#58CC02] rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9.5px] font-mono font-bold text-slate-400">
                        <span>Programme débloqué</span>
                        <span>
                          {completedItemsCount} / {totalItems} éléments terminés
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
