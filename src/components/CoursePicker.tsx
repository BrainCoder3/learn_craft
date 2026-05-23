import { useState } from 'react';
import { Award, Check } from 'lucide-react';
import { Course } from '../types';
import api from '../api';
import CourseIcon from './CourseIcon';

interface CoursePickerProps {
  coursesList: Course[];
  activeCourseId: string | null;
  onEnroll: (courseId: string) => void;
  enrolledCourses?: string[];
  onCancel?: () => void;
}

export default function CoursePicker({ coursesList, activeCourseId, onEnroll, enrolledCourses = [], onCancel }: CoursePickerProps) {
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const handleEnrollClick = async (courseId: string) => {
    setEnrollingId(courseId);
    try {
      await api.enrollCourse(courseId);
      onEnroll(courseId);
    } catch (err) {
      console.error('Error enrolling in path:', err);
    } finally {
      setEnrollingId(null);
    }
  };

  // Filter: ONLY show courses the user has NOT already added
  const availableCourses = coursesList.filter(course => !enrolledCourses.includes(course.id));

  return (
    <div id="full-screen-course-picker" className="min-h-screen overflow-y-auto bg-base flex flex-col justify-start py-12 px-6 lg:px-8 select-none relative">
      {onCancel && (
        <button
          id="course-picker-cancel-btn"
          onClick={onCancel}
          className="absolute top-6 right-6 px-4 py-2 text-xs font-bold text-slate-500 hover:text-[#58CC02] hover:bg-panel border-2 border-transparent hover:border-divider rounded-xl transition-all cursor-pointer bg-panel-muted shadow-sm"
        >
          ← Annuler et Retourner
        </button>
      )}
      <div className="max-w-3xl w-full mx-auto space-y-8 py-6">
        {/* Pitch / Header tagline */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-[#58CC02]/10 border border-[#58CC02]/20 text-[#58CC02] text-[10.5px] font-mono font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full">
            <Award className="w-4 h-4" />
            <span>Parcours de Formation</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-content tracking-tight">
            Ajouter un Nouveau Cours
          </h1>
          <p className="text-sm text-content-muted max-w-xl mx-auto font-medium">
            Les cours interactifs LearnCraft sont conçus pour développer votre maîtrise. Cliquez sur un parcours ci-dessous pour vous y inscrire et commencer à apprendre.
          </p>
        </div>

        {/* Course Cards Grid - 3 per row on desktop, 2 on mobile */}
        {availableCourses.length === 0 ? (
          <div className="text-center py-12 bg-panel rounded-2xl border-2 border-divider">
            <span className="text-4xl">🎉</span>
            <p className="text-content font-extrabold text-sm mt-3">Vous avez ajouté tous les cours disponibles !</p>
            <p className="text-slate-500 text-xs mt-1">Revenez plus tard pour de nouveaux parcours.</p>
          </div>
        ) : (
          <div id="course-picker-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
            {availableCourses.map((course) => {
              const isEnrolled = activeCourseId === course.id;
              const isEnrolling = enrollingId === course.id;

              return (
                <div
                  id={`picker-card-${course.id}`}
                  key={course.id}
                  onClick={() => !isEnrolled && !isEnrolling && handleEnrollClick(course.id)}
                  className={`bg-panel border-2 rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 relative select-none group aspect-square sm:aspect-auto sm:min-h-[220px] ${
                    isEnrolled
                      ? 'border-[#58CC02] shadow-md shadow-[#58CC02]/10'
                      : 'border-divider hover:border-[#58CC02] hover:-translate-y-1 hover:shadow-lg'
                  } ${isEnrolling ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {/* Active/enrolled course gets a green checkmark badge in the top right corner of the card */}
                  {isEnrolled && (
                    <div className="absolute top-3 right-3 bg-[#58CC02] text-white rounded-full p-1 shadow-md flex items-center justify-center border border-white z-10">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}

                  {/* Center loading or large professional icon */}
                  <div className="flex flex-col items-center justify-center mb-4">
                    {isEnrolling ? (
                      <div className="w-12 h-12 rounded-full border-4 border-[#58CC02]/20 border-t-[#58CC02] animate-spin" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center bg-panel-muted border border-divider/60 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <CourseIcon course={course} />
                      </div>
                    )}
                  </div>

                  {/* Course title below it in bold */}
                  <h3 className="text-sm font-extrabold text-content leading-snug px-2">
                    {course.title}
                  </h3>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
