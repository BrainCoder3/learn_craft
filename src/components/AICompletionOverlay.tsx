import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, Presentation, Youtube, BookOpenText, X, BrainCircuit, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';

interface AICompletionOverlayProps {
  courseTitle: string;
  summary: string;
  onClose: () => void;
}

export default function AICompletionOverlay({ courseTitle, summary, onClose }: AICompletionOverlayProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAndSend = async () => {
      let token = localStorage.getItem('token');
      if (!token && auth.currentUser) {
        try {
          token = await auth.currentUser.getIdToken();
        } catch (e) {
          console.warn("Could not retrieve Firebase getIdToken:", e);
        }
      }

      try {
        const resp = await fetch('/api/ai/evaluate', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ courseTitle, summary })
        });
        const json = await resp.json();
        setData(json);
      } catch (err) {
        console.error("AI Evaluation request error:", err);
      } finally {
        setLoading(false);
      }
    };

    getAndSend();
  }, [courseTitle, summary]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-sidebar/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-panel border border-divider shadow-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full cursor-pointer">
          <X className="w-5 h-5 text-slate-500" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Maîtrise du cours : {courseTitle}</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Bot className="w-12 h-12 text-[#58CC02] animate-bounce" />
            <p className="text-sm text-slate-600">L'IA génère vos ressources de perfectionnement...</p>
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Project */}
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold text-sm">
                <BrainCircuit className="w-5 h-5" />
                <h3>Mini-Projet d'évaluation</h3>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{data.miniProject?.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{data.miniProject?.description}</p>
            </div>
            
            {/* Quiz */}
            <div>
                 <div className="flex items-center gap-2 mb-4 text-[#58CC02] font-bold text-sm">
                <BookOpenText className="w-5 h-5" />
                <h3>Quiz de vérification rapide</h3>
              </div>
              <div className="space-y-3">
                 {data.quiz?.map((q: any, i: number) => (
                    <div key={i} className="text-xs bg-slate-50 p-4 rounded-xl border border-divider">
                        <p className="font-bold mb-2">{q.question}</p>
                        <p className="font-mono text-emerald-600">Réponse: {q.answer}</p>
                    </div>
                 ))}
              </div>
            </div>

            {/* Resources */}
            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-xl border border-divider">
                     <h3 className="font-bold text-xs mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" /> Flashcards</h3>
                     <ul className="space-y-2">
                        {data.flashcards?.map((f: any, i: number) => (
                            <li key={i} className="text-[10px] text-slate-600"><strong>{f.term}</strong>: {f.definition}</li>
                        ))}
                     </ul>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-xl border border-divider">
                     <h3 className="font-bold text-xs mb-3 flex items-center gap-2"><Youtube className="w-4 h-4 text-red-500" /> Chaînes YouTube</h3>
                     <ul className="space-y-2">
                        {data.youtubeChannels?.map((y: any, i: number) => (
                           <li key={i}><a href={y.url} className="text-[10px] text-blue-600 underline" target="_blank" rel="noreferrer">{y.name}</a></li>
                        ))}
                     </ul>
                 </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-center py-10">Erreur lors de la génération.</p>
        )}
      </motion.div>
    </div>
  );
}
