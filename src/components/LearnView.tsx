import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Lock, ChevronDown, Check, ArrowRight, BookOpen, HelpCircle, Laptop, Send, Award, Sparkles, CheckSquare, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../api';
import { Course, Chapter, LearningItem } from '../types';
import { getLessonSteps, LessonStep } from '../utils/lessonSteps';
import AICompletionOverlay from './AICompletionOverlay';

interface LearnViewProps {
  coursesList: Course[];
  activeCourseId: string;
  onBackToPicker: () => void;
}

export default function LearnView({ coursesList, activeCourseId, onBackToPicker }: LearnViewProps) {
  const [courseDetails, setCourseDetails] = useState<any | null>(null);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Active learning workspace item (if null, we show the path screen)
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // General state variables for lesson stepper & verification
  const [currentLessonStep, setCurrentLessonStep] = useState(0);
  const [showCongratsScreen, setShowCongratsScreen] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [streakCheckedToday, setStreakCheckedToday] = useState(false);
  const [streakAlreadyActive, setStreakAlreadyActive] = useState(false);

  // Form states inside Learning View (Exercises / Projects)
  const [exerciseAnswer, setExerciseAnswer] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // AI Completion state
  const allItems = courseDetails?.chapters?.flatMap((c: any) => c.items || []);
  const allCompleted = allItems && allItems.length > 0 && allItems.every((item: any) => completedItems.includes(item.id));
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);

  useEffect(() => {
    if (allCompleted && completedItems.length > 0) {
      setShowCompletionOverlay(true);
    }
  }, [allCompleted, completedItems]);

  // Selected course object
  const currentCourse = coursesList.find(c => c.id === activeCourseId);

  // Load course syllabus & user progress
  const loadCourseSyllabus = async () => {
    setLoading(true);
    try {
      const details = await api.getCourseLearn(activeCourseId);
      setCourseDetails(details);

      const progress = await api.getProgress(activeCourseId);
      // derive completed items list
      const completedList = Object.keys(progress).filter(id => progress[id]?.completed);
      setCompletedItems(completedList);

      // Verify if the user study streak was already active/continued today before this lesson interaction
      const rawProgress = await api.getProgressDoc(activeCourseId);
      if (rawProgress && rawProgress.lastUpdated) {
        let lastUpdatedDate: Date;
        if (rawProgress.lastUpdated.seconds) {
          lastUpdatedDate = new Date(rawProgress.lastUpdated.seconds * 1000);
        } else if (typeof rawProgress.lastUpdated.toDate === 'function') {
          lastUpdatedDate = rawProgress.lastUpdated.toDate();
        } else {
          lastUpdatedDate = new Date(rawProgress.lastUpdated);
        }
        if (!isNaN(lastUpdatedDate.getTime())) {
          const today = new Date();
          const isToday = lastUpdatedDate.getDate() === today.getDate() &&
                          lastUpdatedDate.getMonth() === today.getMonth() &&
                          lastUpdatedDate.getFullYear() === today.getFullYear();
          setStreakAlreadyActive(isToday);
        } else {
          setStreakAlreadyActive(false);
        }
      } else {
        setStreakAlreadyActive(false);
      }
    } catch (err) {
      console.error('Error loading course syllabus:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseSyllabus();
  }, [activeCourseId]);

  useEffect(() => {
    if (courseDetails) {
      const tempItemsList: LearningItem[] = [];
      const tempItemToChapterMap: Record<string, Chapter> = {};

      courseDetails.chapters.forEach((ch: any) => {
        const chItems = ch.items || [];
        chItems.forEach((it: any) => {
          tempItemsList.push(it);
          tempItemToChapterMap[it.id] = ch;
        });
      });

      const activeItemIns = tempItemsList.find(it => it.id === activeItemId);
      const activeChapterIns = activeItemIns ? tempItemToChapterMap[activeItemIns.id] : null;

      const lessonStepsIns = activeItemIns && activeItemIns.type === 'lesson'
        ? getLessonSteps(activeItemIns.id, activeItemIns.title, activeItemIns.content || '')
        : [];
      const currentStepDataIns = lessonStepsIns[currentLessonStep];

      const ctx = {
        tab: 'learn',
        courseId: activeCourseId,
        courseTitle: courseDetails.title,
        activeChapter: activeChapterIns ? { title: activeChapterIns.title, chapterNumber: activeChapterIns.chapterNumber } : null,
        activeItem: activeItemIns ? {
          id: activeItemIns.id,
          title: activeItemIns.title,
          type: activeItemIns.type,
          content: activeItemIns.content,
          question: activeItemIns.question,
          options: activeItemIns.options,
          requirements: activeItemIns.requirements,
          hints: activeItemIns.hints
        } : null,
        currentStepIndex: currentLessonStep,
        currentStepText: (activeItemIns?.type === 'lesson' && currentStepDataIns) ? currentStepDataIns.markdown : null,
        viewingSyllabus: !activeItemId
      };
      window.dispatchEvent(new CustomEvent('learncraft-context-change', { detail: ctx }));
    }
  }, [activeCourseId, courseDetails, activeItemId, currentLessonStep]);

  if (loading || !courseDetails) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#58CC02]/20 border-t-[#58CC02] animate-spin"></div>
          <p className="text-content-muted text-sm font-medium">Assemblage du programme de cours...</p>
        </div>
      </div>
    );
  }

  // Flatten items in sequence to determine locks & next logic
  const itemsList: LearningItem[] = [];
  const itemToChapterMap: Record<string, Chapter> = {};

  courseDetails.chapters.forEach((ch: any) => {
    const chItems = ch.items || [];
    chItems.forEach((it: any) => {
      itemsList.push(it);
      itemToChapterMap[it.id] = ch;
    });
  });

  // Calculate status (Completed, Unlocked, Locked) for each item in sequential order - everything is unlocked
  const getItemStatus = (itemId: string, index: number) => {
    const isCompleted = completedItems.includes(itemId);
    // Everything is fully unlocked and browseable
    const isUnlocked = true;
    const isCurrent = !isCompleted;
    return { isCompleted, isUnlocked, isCurrent };
  };

  // Find the current active item object in workspace
  const activeItem = itemsList.find(it => it.id === activeItemId);
  const activeItemIndex = itemsList.findIndex(it => it.id === activeItemId);
  const activeItemStatus = activeItem ? getItemStatus(activeItem.id, activeItemIndex) : null;
  const activeChapter = activeItem ? itemToChapterMap[activeItem.id] : null;

  // 10-step lesson stepper definition
  const lessonSteps = activeItem && activeItem.type === 'lesson'
    ? getLessonSteps(activeItem.id, activeItem.title, activeItem.content || '')
    : [];
  const currentStepData = lessonSteps[currentLessonStep];

  // Progress calculations in current chapter for the top progress bar
  const getChapterProgress = (chId: string) => {
    const ch = courseDetails.chapters.find((c: any) => c.id === chId);
    if (!ch || !ch.items || ch.items.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const total = ch.items.length;
    const completed = ch.items.filter((it: any) => completedItems.includes(it.id)).length;
    const percentage = (completed / total) * 100;
    return { completed, total, percentage };
  };

  // Submit completion handler
  const handleCompleteActiveItem = async () => {
    if (!activeItem) return;
    setSubmitting(true);
    setFeedback(null);

    // Validate payloads
    const payload: any = {};
    if (activeItem.type === 'exercise') {
      if (!exerciseAnswer.trim()) {
        setFeedback({ type: 'error', message: 'You must provide an answer to check.' });
        setSubmitting(false);
        return;
      }
      payload.answer = exerciseAnswer.trim();
    } else if (activeItem.type === 'project') {
      if (!projectCode.trim() || projectCode.trim().length < 15) {
        setFeedback({ type: 'error', message: 'Please write a complete code solution (minimum 15 characters).' });
        setSubmitting(false);
        return;
      }
      payload.isProjectSubmit = true;
      payload.submissionText = projectCode.trim();
    }

    try {
      const res = await api.completeItem(activeCourseId, activeItem.id, payload);

      if (res.correct === false) {
        setFeedback({ type: 'error', message: res.message || 'Incorrect submission. Try again!' });
        setSubmitting(false);
        return;
      }

      // Success
      setFeedback({ type: 'success', message: res.message || 'Perfect! Completed successfully.' });
      
      // Update local completed list
      if (!completedItems.includes(activeItem.id)) {
        setCompletedItems(prev => [...prev, activeItem.id]);
      }

      // Checked the daily streak as completed
      setStreakCheckedToday(true);

      // Show congratulations screen to block auto-advance, let user quit gracefully
      setTimeout(() => {
        setFeedback(null);
        setExerciseAnswer('');
        setProjectCode('');
        setShowCongratsScreen(true);
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Submission failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Safe markdown render for lesson contents
  const renderLessonContent = (text: string) => {
    const lines = text.split('\n');
    let insideCode = false;
    let codeBlock: string[] = [];

    return lines.map((line, idx) => {
      if (line.trim().startsWith('```')) {
        if (insideCode) {
          insideCode = false;
          const blockContent = codeBlock.join('\n');
          codeBlock = [];
          return (
            <pre key={idx} className="bg-sidebar-panel text-teal-400 font-mono text-xs p-5 rounded-2xl my-5 overflow-x-auto leading-relaxed whitespace-pre">
              <code>{blockContent}</code>
            </pre>
          );
        } else {
          insideCode = true;
          return null;
        }
      }

      if (insideCode) {
        codeBlock.push(line);
        return null;
      }

      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-bold text-content mt-8 mb-4">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-content mt-6 mb-3">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-xs text-content-muted leading-relaxed my-2">
            {line.substring(2)}
          </li>
        );
      }

      if (line.trim().length === 0) return <div key={idx} className="h-3" />;
      return <p key={idx} className="text-xs text-content-muted leading-relaxed my-3.5">{line}</p>;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-base text-content relative">
      <AnimatePresence mode="wait">
      {/* NO ACTIVE ITEM COMPLETED/UNLOCKED PATH SCREEN VIEW */}
      {!activeItemId ? (
        <motion.div 
          key="path-view"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto flex flex-col h-full w-full absolute inset-0"
        >
          {/* Course title in a green banner at the top */}
          <div id="course-header-banner" className="bg-[#58CC02] text-white px-8 py-10 shadow-sm relative overflow-hidden select-none shrink-0 rounded-b-[2rem] border-b border-[#46A302]">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <span className="bg-panel/20 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                  {currentCourse?.category} • {currentCourse?.difficulty}
                </span>
                <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight mt-2.5">
                  {courseDetails.title}
                </h2>
                <p className="text-sm mt-1.5 opacity-90 max-w-2xl font-medium">
                  {courseDetails.description}
                </p>
              </div>
            </div>
            {/* Elegant glowing absolute dots */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none bg-gradient-to-l from-white/30 to-transparent rounded-full" />
          </div>

          {/* Vertical Zigzag Path Board container */}
          <div className="max-w-xl mx-auto w-full px-6 py-12 relative flex-1">
            {/* The vertical connection line running behind nodes */}
            <div className="hidden absolute left-1/2 -translate-x-1/2 top-10 bottom-10 w-1.5 bg-slate-300 rounded-full z-0" />

            <div className="space-y-12 relative z-10">
              {courseDetails.chapters.map((ch: any, chIndex: number) => {
                const isChapterCompleted = ch.items?.every((it: any) => completedItems.includes(it.id));
                const isChapterUnlocked = true; // All chapters are unlocked so students can learn anything freely

                return (
                  <div key={ch.id} className="space-y-6">
                    {/* Chapter Header Card inside the path */}
                    <div className="bg-panel border-2 border-divider rounded-2xl p-5 text-center shadow-sm relative max-w-sm mx-auto">
                      <span className="text-[10px] font-mono font-bold text-[#58CC02] uppercase tracking-wider">
                        Chapitre {ch.chapterNumber}
                      </span>
                      <h3 className="text-sm font-bold text-content mt-1">{ch.title}</h3>
                      <p className="text-[11px] text-content-muted mt-1.5">{ch.description}</p>
                      
                      {!isChapterUnlocked && (
                        <div className="absolute inset-0 bg-panel/70 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 px-3 py-1 rounded-xl text-slate-500 text-xs font-bold">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Débloquer le chapitre {ch.chapterNumber}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Zigzag circular nodes list */}
                    <div className="flex flex-col items-center space-y-8 py-4">
                      {ch.items?.map((item: LearningItem, itemIdx: number) => {
                        // Locate index of this item in global itemsList to check conditions
                        const globalIndex = itemsList.findIndex(it => it.id === item.id);
                        const { isCompleted, isUnlocked, isCurrent } = getItemStatus(item.id, globalIndex);

                        // Horizontal stagger offset calculations (translate-x pattern)
                        // Zigzag stagger pattern offsets
                        const staggerOffsets = [
                          'translate-x-0',     // center
                          '-translate-x-12',   // left
                          'translate-x-0',     // center
                          'translate-x-12'     // right
                        ];
                        const offsetClass = staggerOffsets[itemIdx % staggerOffsets.length];

                        return (
                          <div
                            key={item.id}
                            className={`flex flex-col items-center group ${offsetClass} transition-transform duration-300`}
                          >
                            <button
                              id={`node-${item.id}`}
                              disabled={!isUnlocked}
                              onClick={() => {
                                setExerciseAnswer('');
                                setProjectCode('');
                                setFeedback(null);
                                setCurrentLessonStep(0);
                                setShowCongratsScreen(false);
                                setQuizFeedback(null);
                                setSelectedQuizOption(null);
                                setStreakCheckedToday(false);
                                setActiveItemId(item.id);
                              }}
                              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center relative cursor-pointer select-none border-4 transition-all duration-200 outline-none ${
                                isCompleted
                                  ? 'bg-[#58CC02] border-[#58CC02] hover:bg-[#46A302] hover:border-[#46A302] text-white shadow-md shadow-[#58CC02]/20'
                                  : isCurrent
                                    ? 'bg-panel border-[#58CC02] text-[#58CC02] hover:scale-105 active:scale-95 shadow-lg shadow-[#58CC02]/10 ring-4 ring-[#58CC02]/20 animate-pulse'
                                    : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="w-9 h-9 stroke-[3]" />
                              ) : isCurrent ? (
                                <div className="flex flex-col items-center">
                                  {item.type === 'lesson' && <BookOpen className="w-6 h-6 stroke-[2.5]" />}
                                  {item.type === 'exercise' && <HelpCircle className="w-6 h-6 stroke-[2.5]" />}
                                  {item.type === 'project' && <Laptop className="w-6 h-6 stroke-[2.5]" />}
                                  <span className="text-[10px] font-mono font-extrabold uppercase mt-1 tracking-wider leading-none">
                                    DÉBUTER
                                  </span>
                                </div>
                              ) : (
                                <Lock className="w-6 h-6" />
                              )}
                            </button>

                            {/* Node labels underneath */}
                            <div className="mt-2 text-center max-w-[140px]">
                              <span className="text-[10px] font-bold text-slate-700 block truncate">
                                {item.title}
                              </span>
                              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                                {item.type}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      ) : (
        /* -------------------------------------------------------------------------- */
        /* ACTIVE CURRENT SCREEN VIEW: LEARNING WORKSPACE VIEW                         */
        /* -------------------------------------------------------------------------- */
        <motion.div 
          key={activeItemId || "learning-view"}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col bg-panel h-full overflow-hidden absolute inset-0 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]"
        >
          {/* Header Action menu line */}
          <div className="bg-panel-muted border-b border-divider px-8 py-5 flex items-center justify-between select-none">
            <button
              id="close-learning-view-btn"
              onClick={() => {
                setActiveItemId(null);
                loadCourseSyllabus();
                setShowCongratsScreen(false);
                setCurrentLessonStep(0);
                setQuizFeedback(null);
                setSelectedQuizOption(null);
                setStreakCheckedToday(false);
              }}
              className="flex items-center gap-2 text-xs font-bold text-content-muted hover:text-[#58CC02] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Retour à la feuille de route</span>
            </button>

            <div className="text-center font-bold">
              <span className="text-[10px] font-mono text-[#58CC02] uppercase tracking-wider block">
                Progression des objectifs du chapitre
              </span>
              <p className="text-xs text-slate-800 font-extrabold">
                {activeItem?.title}
              </p>
            </div>

            <span className="text-[10px] text-slate-500 bg-slate-200/60 border border-slate-300 font-mono px-3 py-1 rounded-full uppercase font-bold">
              {activeItem?.type}
            </span>
          </div>

          {/* Progress bar at the top showing position in chapter */}
          {activeChapter && (
            <div id="learning-progress-tracker" className="w-full bg-slate-100 py-3.5 px-8 flex items-center justify-between border-b border-divider select-none font-mono font-bold text-[10.5px]">
              <div className="flex-1 max-w-xl flex items-center gap-4">
                <span className="text-slate-600 truncate shrink-0">Parcours du Chapitre {activeChapter.chapterNumber}</span>
                <div className="h-2.5 flex-1 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                  <div
                    className="h-full bg-[#58CC02] rounded-full transition-all duration-300"
                    style={{ width: `${getChapterProgress(activeChapter.id).percentage}%` }}
                  />
                </div>
                <span className="text-[#58CC02]">
                  {Math.round(getChapterProgress(activeChapter.id).percentage)}% Terminé
                </span>
              </div>
              <div className="text-slate-500 shrink-0 select-none">
                {getChapterProgress(activeChapter.id).completed} sur {getChapterProgress(activeChapter.id).total} objectifs terminés
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-8 py-10">
            <div className="max-w-3xl mx-auto">
              {showCongratsScreen ? (
                /* -------------------------------------------------------------------------- */
                /* CONGRATULATIONS SCREEN (STREAK VERIFIED & EXPLICIT MANUAL RETURN TO PATH)     */
                /* -------------------------------------------------------------------------- */
                <div role="region" aria-label="Completion status" className="bg-panel border-2 border-divider rounded-[2.5rem] p-10 text-center shadow-xl relative overflow-hidden">
                  {/* Confetti styles */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#58CC02]/5 rounded-full blur-2xl -translate-y-10 translate-x-10" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl translate-y-10 -translate-x-10" />

                  {!streakAlreadyActive ? (
                    <>
                      {/* Flame symbol representing active streak */}
                      <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6 border-4 border-amber-300 relative animate-bounce">
                        <span className="text-5xl select-none">🔥</span>
                        <div className="absolute -top-1 -right-1 bg-[#58CC02] text-white p-1 rounded-full border-2 border-white">
                          <Check className="w-4.5 h-4.5 stroke-[3]" />
                        </div>
                      </div>

                      <span className="bg-[#58CC02]/10 text-[#46A302] text-[10.5px] font-mono font-extrabold px-4.5 py-1.5 rounded-full uppercase tracking-widest block w-fit mx-auto mb-4 select-none">
                        Série quotidienne enregistrée et vérifiée
                      </span>

                      <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none mb-3">
                        Module de cours terminé ! 🎉
                      </h2>
                      <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto mb-8 leading-relaxed">
                        Effort sensationnel ! Votre série d'études quotidienne a été vérifiée et enregistrée. Vous avez débloqué de nouveaux défis !
                      </p>

                      {/* Daily streak indicator calendar block */}
                      <div className="bg-panel-muted border border-divider rounded-2xl p-6 mb-8 select-none max-w-md mx-auto">
                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest text-center mb-4.5">
                          Objectif du calendrier d'étude hebdomadaire
                        </p>
                        <div className="grid grid-cols-7 gap-2">
                          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, dIdx) => {
                            // Highlight Friday as the active completed streak node (day 5)
                            const isToday = dIdx === 4; 
                            return (
                              <div key={day} className="flex flex-col items-center">
                                <span className="text-[9px] font-bold text-slate-400 font-mono mb-1.5">{day}</span>
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border transition-all duration-300 ${
                                    isToday
                                      ? 'bg-[#58CC02] border-[#58CC02] text-white shadow-md shadow-[#58CC02]/30 scale-110'
                                      : 'bg-emerald-50 border-emerald-100 text-[#46A302]'
                                  }`}
                                >
                                  {isToday ? (
                                    <span className="text-sm select-none">🔥</span>
                                  ) : (
                                    <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#46A302] font-extrabold uppercase font-mono bg-[#58CC02]/10 py-2.5 px-4 rounded-xl border border-[#58CC02]/20">
                          <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                          <span>Série quotidienne validée avec succès ! +1 jour</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Quiet/implicit non-duplicated completion state without duplicating streak block */}
                      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 border-4 border-emerald-300 relative">
                        <CheckCircle2 className="w-10 h-10 text-[#58CC02]" />
                      </div>

                      <span className="bg-emerald-50 text-emerald-800 text-[10.5px] font-mono font-extrabold px-4.5 py-1.5 rounded-full uppercase tracking-widest block w-fit mx-auto mb-4 select-none">
                        Maîtrise du module débloquée
                      </span>

                      <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none mb-3">
                        Module de cours terminé ! 🎉
                      </h2>
                      <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto mb-8 leading-relaxed">
                        Excellent travail ! La complétion de votre module a été enregistrée. Votre série quotidienne est déjà active aujourd'hui. Continuez sur cette belle lancée !
                      </p>
                    </>
                  )}

                  {/* Clear primary return action, ensuring the user quits when finished rather than auto-advancing */}
                  <button
                    id="finish-and-quit-return-btn"
                    onClick={() => {
                      setShowCongratsScreen(false);
                      setActiveItemId(null);
                      loadCourseSyllabus();
                    }}
                    className="w-full max-w-md mx-auto bg-[#58CC02] hover:bg-[#46A302] text-white text-xs font-bold py-4 rounded-2xl transition-all shadow-lg shadow-[#58CC02]/20 hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                    <span>Retour au tableau des chapitres</span>
                  </button>
                </div>
              ) : (
                /* -------------------------------------------------------------------------- */
                /* MODULE WORKSPACE CARD (LESSONS VS EXERCISES VS PROJECTS)                  */
                /* -------------------------------------------------------------------------- */
                <div className="space-y-6">
                  <div className="bg-panel border-2 border-divider rounded-2xl p-8 shadow-sm">
                    {/* Visual Category Label */}
                    <div className="flex items-center gap-2 text-[#58CC02] mb-4 text-[10px] font-mono tracking-widest font-extrabold uppercase select-none">
                      {activeItem?.type === 'lesson' && <BookOpen className="w-4 h-4 stroke-[2.5]" />}
                      {activeItem?.type === 'exercise' && <HelpCircle className="w-4 h-4 stroke-[2.5]" />}
                      {activeItem?.type === 'project' && <Laptop className="w-4 h-4 stroke-[2.5]" />}
                      <span>Tâche active du module</span>
                    </div>

                    <h2 className="text-xl font-bold text-content tracking-tight mb-6">
                      {activeItem?.title}
                    </h2>

                    {/* 1. LESSON STEPPER DECK WORKSPACE (Exactly 10 interactive elements/slides) */}
                    {activeItem?.type === 'lesson' && currentStepData && (
                      <div className="space-y-6 pt-4 border-t border-divider">
                        {/* Interactive Step Slider Progress dots */}
                        <div className="flex items-center gap-2 mb-6 select-none bg-panel-muted border border-divider p-3 rounded-2xl">
                          <span className="text-[9.5px] font-mono font-extrabold text-[#5c687e] uppercase tracking-wider shrink-0">
                            Entraînement Étape {currentLessonStep + 1} sur {lessonSteps.length}
                          </span>
                          <div className="flex-1 flex gap-1 h-2 rounded-full overflow-hidden bg-slate-200">
                            {lessonSteps.map((_, idx) => (
                              <div
                                key={idx}
                                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                                  idx <= currentLessonStep
                                    ? 'bg-[#58CC02]'
                                    : 'bg-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Interactive Step Body Card */}
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentLessonStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-5"
                          >
                            <div className="flex items-center gap-2.5 bg-panel-muted border border-divider p-4 rounded-2xl select-none font-sans font-bold text-slate-805 text-xs">
                            <span className="w-6 h-6 rounded-full bg-[#58CC02]/25 text-[#46A302] flex items-center justify-center text-xs font-extrabold font-mono shrink-0">
                              {currentLessonStep + 1}
                            </span>
                            <span>{currentStepData.title}</span>
                          </div>

                          {currentStepData.type === 'info' ? (
                            <div className="space-y-4">
                              <div className="text-slate-600 text-xs leading-relaxed font-semibold">
                                {renderLessonContent(currentStepData.markdown || '')}
                              </div>
                              {currentStepData.codeSnippet && (
                                <div className="rounded-2xl overflow-hidden border border-slate-700 mt-4 shadow-md">
                                  <div className="bg-slate-850 px-4 py-2 flex justify-between items-center text-[9px] font-mono text-slate-400 select-none border-b border-slate-700">
                                    <span>MINI EXEMPLES ÉDITABLES</span>
                                    <span className="text-teal-400 font-bold">interpreteur-python</span>
                                  </div>
                                  <pre className="bg-sidebar-panel p-5 font-mono text-teal-300 text-xs overflow-x-auto leading-relaxed whitespace-pre">
                                    <code>{currentStepData.codeSnippet}</code>
                                  </pre>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* INTERACTIVE STEP QUIZ INLINE DRILL */
                            <div className="space-y-5 pt-1">
                              <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-xl text-xs font-semibold text-amber-900 leading-relaxed flex items-start gap-3">
                                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <span>{currentStepData.question}</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
                                {currentStepData.options?.map((opt, oIdx) => {
                                  const isSelected = selectedQuizOption === opt;
                                  const isAnswered = quizFeedback !== null;

                                  return (
                                    <button
                                      key={oIdx}
                                      disabled={isAnswered && quizFeedback?.isCorrect}
                                      onClick={() => {
                                        setSelectedQuizOption(opt);
                                        const isCorrect = opt === currentStepData.correctAnswer;
                                        setQuizFeedback({
                                          isCorrect,
                                          message: isCorrect
                                            ? 'Travail exceptionnel ! Cette option est tout à fait correcte.'
                                            : 'Sélection incorrecte. Veuillez revoir la théorie et essayer une autre option !'
                                        });
                                      }}
                                      className={`p-4 text-left rounded-2xl border-2 text-xs font-bold cursor-pointer transition-all duration-200 select-none ${
                                        isSelected
                                          ? quizFeedback?.isCorrect
                                            ? 'border-[#58CC02] bg-[#58CC02]/10 text-[#46A302] shadow-sm shadow-[#58CC02]/10'
                                            : 'border-rose-500 bg-rose-50 text-rose-700 font-extrabold'
                                          : 'border-divider bg-panel hover:border-slate-300 text-slate-700'
                                      }`}
                                    >
                                      <span className="inline-block w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-center leading-6 font-mono font-bold text-[10px] mr-2.5">
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {quizFeedback && (
                                <div
                                  className={`p-4 rounded-xl border flex gap-3 text-xs font-bold leading-relaxed transition-all duration-200 ${
                                    quizFeedback.isCorrect
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                      : 'bg-rose-50 border-rose-200 text-rose-700'
                                  }`}
                                >
                                  <span className="text-sm shrink-0">{quizFeedback.isCorrect ? '✨' : '⚠️'}</span>
                                  <p>{quizFeedback.message}</p>
                                </div>
                              )}
                            </div>
                          )}
                          </motion.div>
                        </AnimatePresence>

                        {/* Interactive Actions line inside active Lesson step card */}
                        <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                          <button
                            type="button"
                            disabled={currentLessonStep === 0}
                            onClick={() => {
                              setCurrentLessonStep(prev => prev - 1);
                              setQuizFeedback(null);
                              setSelectedQuizOption(null);
                            }}
                            className="px-5 py-2.5 rounded-xl border-2 border-divider text-slate-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-40 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Étape précédente
                          </button>

                          {currentStepData.type === 'quiz' && (!quizFeedback || !quizFeedback.isCorrect) ? (
                            <span className="text-[10px] text-slate-400 font-mono font-extrabold tracking-wide uppercase select-none animate-pulse">
                              * Sélectionnez la bonne option pour continuer
                            </span>
                          ) : (
                            <button
                              id="lesson-step-continue-btn"
                              onClick={async () => {
                                if (currentLessonStep < lessonSteps.length - 1) {
                                  setCurrentLessonStep(prev => prev + 1);
                                  setQuizFeedback(null);
                                  setSelectedQuizOption(null);
                                } else {
                                  // Save lesson module completion on Firestore and check streak!
                                  await handleCompleteActiveItem();
                                }
                              }}
                              className="bg-[#58CC02] hover:bg-[#46A302] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-[#58CC02]/10 cursor-pointer flex items-center gap-2"
                            >
                              <span>
                                {currentLessonStep < lessonSteps.length - 1
                                  ? 'Étape suivante'
                                  : 'Terminer la leçon'}
                              </span>
                              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. Exercise display (question and user typed text answer block) */}
                    {activeItem?.type === 'exercise' && activeItem.question && (
                      <div className="space-y-6 pt-2 border-t border-slate-100 pt-6">
                        <div className="bg-panel-muted border-2 border-divider p-5 rounded-xl font-bold text-xs text-slate-800 leading-relaxed">
                          {activeItem.question}
                        </div>

                        {/* Helper options if the database contains standard multiple-choice suggestions */}
                        {activeItem.options && activeItem.options.length > 0 && (
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block mb-2 select-none">
                              Options suggérées (cliquez pour remplir le champ) :
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {activeItem.options.map((opt, i) => (
                                <button
                                  id={`option-pill-${i}`}
                                  key={i}
                                  onClick={() => setExerciseAnswer(opt)}
                                  className={`p-3.5 text-xs text-slate-700 bg-panel hover:bg-panel-muted border-2 rounded-xl text-left cursor-pointer transition-colors ${
                                    exerciseAnswer === opt ? 'border-[#58CC02] text-[#46A302]' : 'border-divider'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Compliant text typed input area */}
                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block select-none">
                            Votre réponse écrite :
                          </label>
                          <input
                            id="exercise-answer-input"
                            type="text"
                            placeholder="Saisissez ou cliquez sur une option suggérée pour la coller ici..."
                            value={exerciseAnswer}
                            onChange={(e) => setExerciseAnswer(e.target.value)}
                            className="w-full bg-panel-muted border-2 border-divider px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#58CC02]/50 focus:border-[#58CC02] transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {/* 3. Project requirements and workspace solver */}
                    {activeItem?.type === 'project' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-slate-100 pt-6">
                        <div className="space-y-5">
                          <span className="text-[10px] font-bold font-mono text-[#D97706] tracking-wider uppercase block select-none">
                            Exigences du projet
                          </span>
                          <div className="space-y-3">
                            {activeItem.requirements?.map((req, i) => (
                              <div key={i} className="flex gap-3 text-xs leading-relaxed text-slate-600 font-medium">
                                <CheckSquare className="w-4.5 h-4.5 text-[#58CC02] shrink-0 mt-0.5" />
                                <span>{req}</span>
                              </div>
                            ))}
                          </div>

                          {activeItem.hints && activeItem.hints.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 p-4.5 rounded-xl text-[11px] text-amber-800 leading-relaxed font-semibold">
                              <strong className="block text-amber-900 border-b border-amber-200/60 pb-1 mb-1.5 uppercase tracking-wide">
                                Indices & consignes
                              </strong>
                              {activeItem.hints.map((hint, j) => (
                                <p key={j} className="mt-1">
                                  • {hint}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] font-bold font-mono text-teal-600 tracking-wider uppercase block select-none">
                            Espace de code du projet
                          </span>
                          <textarea
                            id="project-solver-textarea"
                            placeholder="// Collez ou rédigez votre code ici (minimum 15 caractères)..."
                            value={projectCode}
                            onChange={(e) => setProjectCode(e.target.value)}
                            className="w-full h-72 bg-sidebar-panel text-teal-300 font-mono text-xs p-4.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#58CC02] resize-y leading-relaxed"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Exercises / Projects Footer Action Bar (only visible when not Lesson type because Lessons have their step buttons) */}
                  {activeItem?.type !== 'lesson' && (
                    <div className="space-y-4">
                      {feedback && (
                        <div
                          id="submit-feedback-banner"
                          className={`p-4 rounded-xl border-2 flex gap-3 text-xs leading-relaxed ${
                            feedback.type === 'success'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {feedback.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <strong className="block font-bold">
                              {feedback.type === 'success' ? 'Tâche réussie' : 'Problème d\'évaluation'}
                            </strong>
                            <p className="mt-0.5 font-semibold">{feedback.message}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center bg-panel-muted border border-divider p-5 rounded-2xl select-none">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                            Moteur de vérification de progression
                          </span>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            La soumission enregistre votre progression en toute sécurité sur Firestore.
                          </p>
                        </div>

                        <button
                          id="learning-action-continue-btn"
                          disabled={submitting}
                          onClick={handleCompleteActiveItem}
                          className="bg-[#58CC02] hover:bg-[#46A302] disabled:opacity-55 text-white text-xs font-bold px-7 py-3 rounded-xl transition-all shadow-md shadow-[#58CC02]/10 cursor-pointer flex items-center gap-2"
                        >
                          {submitting ? (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 stroke-[2]" />
                          )}
                          <span>
                            {activeItem?.type === 'exercise' ? 'Vérifier la réponse' : 'Soumettre le projet'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
      {showCompletionOverlay && (
        <AICompletionOverlay 
          courseTitle={courseDetails.title} 
          summary={courseDetails.description} 
          onClose={() => setShowCompletionOverlay(false)} 
        />
      )}
    </div>
  );
}
