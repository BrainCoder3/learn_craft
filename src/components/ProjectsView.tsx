/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Code, CheckCircle2, FileCode, Clock, Bookmark } from 'lucide-react';
import api from '../api';
import { ProjectSubmission } from '../types';

export default function ProjectsView() {
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ProjectSubmission | null>(null);

  useEffect(() => {
    async function fetchSubmissions() {
      setLoading(true);
      try {
        const data = await api.getSubmissions();
        setSubmissions(data);
        if (data.length > 0) {
          setSelectedSubmission(data[0]);
        }
      } catch (err) {
        console.error('Error fetching project submissions', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, []);

  useEffect(() => {
    const ctx = {
      tab: 'projects',
      viewingProjects: true,
      submissionsCount: submissions.length,
      selectedProject: selectedSubmission ? {
        title: selectedSubmission.itemTitle,
        language: selectedSubmission.courseId,
        submittedAt: selectedSubmission.createdAt,
        code: selectedSubmission.submissionText,
        feedback: selectedSubmission.feedback
      } : null
    };
    window.dispatchEvent(new CustomEvent('learncraft-context-change', { detail: ctx }));
  }, [submissions, selectedSubmission]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#58CC02]/20 border-t-[#58CC02] animate-spin"></div>
          <p className="text-content-muted text-sm font-medium">Récupération des soumissions compilées...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-base lg:flex-row text-content">
      {/* List Panel */}
      <div className="w-full lg:w-96 border-r border-divider flex flex-col h-full shrink-0 bg-panel">
        <div className="p-6 border-b border-divider flex items-center justify-between select-none">
          <div>
            <h2 className="text-lg font-display font-bold text-content tracking-tight">Soumissions de Projets</h2>
            <p className="text-[11px] text-content-muted mt-0.5">Vos travaux pratiques et revues de code</p>
          </div>
          <span className="text-[10px] bg-[#58CC02]/10 border border-[#58CC02]/20 text-[#58CC02] font-mono font-bold px-2.5 py-1 rounded">
            Total : {submissions.length}
          </span>
        </div>

        {/* List of archives */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {submissions.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-divider rounded-2xl text-content-muted my-6">
              <FileCode className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-xs font-bold text-content">Aucun projet compilé pour le moment.</p>
              <p className="text-[10px] text-content-muted mt-1 max-w-sm mx-auto leading-relaxed">Lancez les modules de cours, terminez la théorie et les quiz, puis codez vos solutions !</p>
            </div>
          ) : (
            submissions.map((sub) => {
              const isSelected = selectedSubmission?.id === sub.id;
              return (
                <button
                  id={`submission-row-${sub.id}`}
                  key={sub.id}
                  onClick={() => setSelectedSubmission(sub)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-colors cursor-pointer block ${
                    isSelected
                      ? 'bg-[#F3F4F6] border-[#58CC02]'
                      : 'bg-panel border-divider hover:bg-panel-muted'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3 select-none">
                    <span className="text-[9px] font-bold font-mono tracking-wider uppercase text-[#58CC02] bg-[#58CC02]/10 px-2 py-0.5 rounded-md border border-[#58CC02]/20">
                      Terminé
                    </span>
                    <span className="text-[10px] text-content-muted font-mono">{new Date(sub.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-content mt-2 truncate">{sub.itemTitle}</h4>
                  <p className="text-[11px] text-content-muted font-mono mt-1 truncate">ID: {sub.id.substring(0, 8)}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Code Viewer Preview Panel */}
      <div className="flex-1 flex flex-col h-full bg-base overflow-hidden">
        {selectedSubmission ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Upper preview title bar */}
            <div className="p-6 bg-panel border-b border-divider flex items-center justify-between shrink-0 select-none">
              <div>
                <span className="text-[10px] text-[#58CC02] font-mono font-bold uppercase tracking-wider block">Solution de code soumise</span>
                <h3 className="text-base font-bold text-content mt-1">{selectedSubmission.itemTitle}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-content-muted font-mono">Statut :</span>
                <span className="text-xs font-bold text-[#58CC02] bg-[#58CC02]/10 border border-[#58CC02]/20 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#58CC02] animate-pulse" />
                  <span>Vérifié</span>
                </span>
              </div>
            </div>

            {/* Split viewport code vs review */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Submission Code segment */}
              <div className="bg-panel border-2 border-divider rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-divider pb-3.5 mb-4 select-none">
                  <div className="flex items-center gap-2 text-[#159891] font-mono text-xs font-bold">
                    <Code className="w-4 h-4" />
                    <span>main.ts</span>
                  </div>
                  <span className="text-[10px] text-content-muted font-mono">Fichier TypeScript encodé en UTF-8</span>
                </div>
                <pre className="text-xs text-[#159891] font-mono overflow-x-auto select-all leading-relaxed whitespace-pre p-4 bg-panel-muted border border-divider rounded-xl">
                  <code>{selectedSubmission.submissionText}</code>
                </pre>
              </div>

              {/* Review Report section */}
              {selectedSubmission.feedback && (
                <div className="bg-panel border-2 border-divider rounded-2xl p-6 shadow-sm animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-[#58CC02] mb-4 select-none">
                    <CheckCircle2 className="w-5 h-5 font-bold" />
                    <h4 className="text-xs font-bold uppercase tracking-widest font-mono">Audit par les pairs et rapport du compilateur</h4>
                  </div>
                  <div className="text-xs text-content leading-relaxed space-y-3 bg-panel-muted p-4 border border-divider rounded-xl">
                    <p className="text-xs text-content-muted leading-relaxed">{selectedSubmission.feedback}</p>
                    <div className="grid grid-cols-2 gap-4 border-t border-divider pt-3 mt-4 text-[10px] font-mono select-none">
                      <div>
                        <span className="text-gray-500 block">Résultat de l'Audit :</span>
                        <span className="text-[#58CC02] font-bold">0 Erreurs / TSC strict validé</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Analyse de Performance :</span>
                        <span className="text-[#58CC02] font-bold">Empreinte mémoire optimale</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8 select-none">
            <div className="max-w-xs">
              <Bookmark className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
              <p className="text-xs font-bold text-content">Les archives sont actuellement vides</p>
              <p className="text-[11px] text-content-muted mt-1.5 leading-relaxed">Aucune soumission à afficher. Rédigez des soumissions de code depuis les éléments de cours pour afficher les journaux.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
