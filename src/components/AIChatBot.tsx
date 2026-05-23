import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Terminal, GraduationCap, Trophy, User, BookOpen, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { auth } from '../firebase';

export default function AIChatBot({ context: propContext }: { context?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [replies, setReplies] = useState<{from: 'user' | 'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [dynamicContext, setDynamicContext] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen to learning platform context changes from each active view screen
  useEffect(() => {
    const handleContextChange = (e: CustomEvent) => {
      setDynamicContext(e.detail);
    };
    window.addEventListener('learncraft-context-change' as any, handleContextChange);
    return () => {
      window.removeEventListener('learncraft-context-change' as any, handleContextChange);
    };
  }, []);

  // Merge propContext and dynamicContext
  const currentContext = dynamicContext || propContext || null;

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [replies, isOpen, loading]);

  // Determine suggestions based on the active screen tab
  const getSuggestions = () => {
    if (!currentContext) {
      return [
        { label: "Que puis-je apprendre ici ? 📚", query: "Quels sont les cours disponibles sur la plateforme et que me conseillez-vous pour débuter ?" },
        { label: "Comment fonctionne le bac à sable ? 💻", query: "Pouvez-vous m'expliquer comment utiliser le compilateur de code ?" }
      ];
    }

    const { tab, activeItem, viewingSyllabus } = currentContext;

    if (tab === 'learn') {
      if (viewingSyllabus) {
        return [
          { label: "Explique l'objectif de ce cours 📖", query: `Quel est l'objectif global du cours de "${currentContext.courseTitle || 'programmation'}" ?` },
          { label: "Suggère un plan d'étude ⚡", query: `Je commence le cours "${currentContext.courseTitle}". Propose-moi un plan d'étude efficace.` }
        ];
      }
      if (activeItem) {
        if (activeItem.type === 'lesson') {
          return [
            { label: "Explique cette leçon simple 📖", query: `Explique-moi le concept présenté dans cette leçon : "${activeItem.title}". Contenu de l'étape : ${currentContext.currentStepText || activeItem.content || ''}` },
            { label: "Propose un exemple de code 💡", query: `Donne-moi un exemple de code pratique et commenté pour illustrer la leçon "${activeItem.title}".` }
          ];
        }
        if (activeItem.type === 'exercise') {
          return [
            { label: "Donne-moi un indice 🕵️", query: `Sans me donner la réponse exacte, peux-tu me guider ou me donner un indice pour résoudre cet exercice : "${activeItem.title}" ? Question : "${activeItem.question}"` },
            { label: "Rappelle-moi la syntaxe de base 🔧", query: `Rappelle-moi la syntaxe de base liée à la question de recherche de l'exercice : "${activeItem.title}".` }
          ];
        }
        if (activeItem.type === 'project') {
          return [
            { label: "Conseils de conception 🏗️", query: `Donne-moi des conseils de conception ou d'architecture logicielle pour réaliser le projet "${activeItem.title}". Ses critères de réussite sont : ${activeItem.requirements?.join(', ') || ''}` },
            { label: "Astuces pour démarrer ce projet 🚀", query: `Par quoi devrais-je commencer pour coder le projet "${activeItem.title}" ? Donne-moi l'algorithme ou l'organisation générale.` }
          ];
        }
      }
    }

    if (tab === 'compiler') {
      const displayCode = currentContext.currentCode || '';
      return [
        { label: "Explique mon code 🕵️", query: `Peux-tu m'expliquer le fonctionnement de mon code écrit dans le bac à sable ? Voici mon code :\n\`\`\`${currentContext.language || 'code'}\n${displayCode}\n\`\`\`` },
        { label: "Trouve les erreurs 🔧", query: `Est-ce qu'il y a des erreurs, des bugs ou des vulnérabilités dans mon code actuel ? Code :\n\`\`\`${currentContext.language || 'code'}\n${displayCode}\n\`\`\`` },
        { label: "Suggère des améliorations ⚡", query: `Comment puis-je optimiser et rendre mon code plus propre ou élégant selon les meilleures pratiques ? Code :\n\`\`\`${currentContext.language || 'code'}\n${displayCode}\n\`\`\`` }
      ];
    }

    if (tab === 'projects') {
      return [
        { label: "Comment sont évalués les projets ? 🎓", query: "Comment fonctionne le système d'évaluation des projets de programmation ?" },
        { label: "Conseil pour briller 🌟", query: "Quelles sont vos meilleures astuces d'ingénierie pour soumettre des projets parfaits ?" }
      ];
    }

    if (tab === 'progress') {
      return [
        { label: "Comment maximiser mon XP ? 📈", query: "Quel est le moyen le plus rapide d'obtenir des points d'expérience (XP) et de maintenir un streak actif ?" },
        { label: "Quelle est la suite ? 🏁", query: `Je progresse sur le cours "${currentContext.courseTitle || 'actif'}". Quelle est la prochaine étape recommandée ?` }
      ];
    }

    if (tab === 'profile') {
      return [
        { label: "Comment obtenir un certificat ? 📜", query: "Comment puis-je remporter des certificats officiels de complétion sur LearnCraft ?" },
        { label: "Conseils pour mon portfolio 🐙", query: "Comment exporter ma progression pour enrichir mon portfolio de développeur original ?" }
      ];
    }

    return [
      { label: "Guide-moi ! 📚", query: "Que puis-je faire maintenant pour continuer mon apprentissage ?" }
    ];
  };

  const handleSend = async (customMsg?: string) => {
    const msgToSend = customMsg || message;
    if (!msgToSend.trim()) return;

    setReplies(prev => [...prev, { from: 'user', text: msgToSend }]);
    if (!customMsg) setMessage('');
    setLoading(true);

    try {
      let token = localStorage.getItem('token');
      if (!token && auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: msgToSend, history: replies, context: currentContext })
      });

      if (!resp.ok) {
        throw new Error(`Erreur serveur : ${resp.status}`);
      }

      const data = await resp.json();
      setReplies(prev => [...prev, { from: 'ai', text: data.reply || "Je n'ai pas pu générer de réponse." }]);
    } catch (e: any) {
      console.error(e);
      setReplies(prev => [...prev, { from: 'ai', text: `Erreur de communication : ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to draw connection ribbon at top
  const renderContextRibbon = () => {
    if (!currentContext) return null;
    const { tab, courseTitle, activeItem, viewingSyllabus } = currentContext;

    let icon = <Bot className="w-3.5 h-3.5" />;
    let desc = "Mode libre";

    if (tab === 'learn') {
      icon = <GraduationCap className="w-3.5 h-3.5 text-[#58CC02]" />;
      desc = viewingSyllabus ? `Aperçu de ${courseTitle || 'Cours'}` : `Étude : ${activeItem?.title || 'Leçon'}`;
    } else if (tab === 'compiler') {
      icon = <Terminal className="w-3.5 h-3.5 text-blue-500 animate-pulse" />;
      desc = "Analyse de code Sandbox actif";
    } else if (tab === 'projects') {
      icon = <Trophy className="w-3.5 h-3.5 text-amber-500" />;
      desc = "Tableau des projets";
    } else if (tab === 'progress') {
      icon = <Sparkles className="w-3.5 h-3.5 text-fuchsia-500" />;
      desc = "Progression & Streak";
    } else if (tab === 'profile') {
      icon = <User className="w-3.5 h-3.5 text-indigo-500" />;
      desc = "Profil du développeur";
    }

    return (
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-divider px-3 py-1.5 flex items-center justify-between gap-2 text-[10px] text-content-muted">
        <div className="flex items-center gap-1.5 truncate">
          {icon}
          <span className="font-semibold truncate">Contextuel : {desc}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">Synchro</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-[#58CC02] text-white rounded-full shadow-lg hover:scale-105 hover:bg-[#46A302] transition-all z-50 cursor-pointer flex items-center justify-center border border-emerald-400/20"
        title="Assistant IA intelligent"
      >
        <Bot className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-24 right-6 w-96 h-[480px] bg-panel shadow-2xl rounded-2xl border border-divider overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="bg-panel px-4 py-3 border-b border-divider flex justify-between items-center bg-gradient-to-r from-panel to-panel-muted">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#58CC02]/15 flex items-center justify-center text-[#58CC02]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs font-display">Tuteur IA intelligent</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 p-1 rounded-lg">
                <X className="w-4 h-4 text-slate-555" />
              </button>
            </div>

            {/* Context Awareness Ribbon */}
            {renderContextRibbon()}

            {/* Conversation Flow */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-base/50">
              {replies.length === 0 && (
                <div className="text-center py-6 px-4">
                  <div className="w-10 h-10 rounded-full bg-[#58CC02]/10 flex items-center justify-center text-[#58CC02] mx-auto mb-2">
                    <Bot className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-content mt-1">Bonjour ! Je suis votre assistant.</p>
                  <p className="text-[11px] text-content-muted mt-1 max-w-xs mx-auto">
                    Je suis synchronisé en temps réel avec ce que vous faites pour vous guider au mieux.
                  </p>
                </div>
              )}

              {replies.map((r, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl text-[11px] leading-relaxed max-w-[88%] ${
                    r.from === 'user'
                      ? 'bg-[#58CC02] text-white self-end ml-auto'
                      : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {r.from === 'user' ? (
                    <div className="whitespace-pre-wrap">{r.text}</div>
                  ) : (
                    <div className="markdown-body select-text">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-800 dark:text-slate-100">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-amber-100 bg-amber-500/10 dark:bg-amber-500/5 px-1 py-0.5 rounded">{children}</strong>,
                          code: ({ node, inline, style, className, children, ...props }: any) => {
                            return (
                              <code className="bg-slate-200/90 dark:bg-slate-900 text-rose-700 dark:text-rose-400 px-1 py-0.5 rounded font-mono text-[10px]" {...props}>
                                {children}
                              </code>
                            );
                          },
                          pre: ({ children }) => (
                            <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-xl font-mono text-[10px] overflow-x-auto my-2 border border-slate-800 max-w-full leading-normal">
                              {children}
                            </pre>
                          ),
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5 text-slate-800 dark:text-slate-100">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5 text-slate-800 dark:text-slate-100">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          h1: ({ children }) => <h1 className="text-xs font-bold mt-3 mb-1 text-slate-900 dark:text-white border-b border-divider pb-0.5">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-[11px] font-bold mt-2.5 mb-1 text-slate-900 dark:text-white">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-[11px] font-bold mt-2 mb-0.5 text-slate-900 dark:text-white">{children}</h3>,
                        }}
                      >
                        {r.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-1.5 text-[10px] text-content-muted">
                  <div className="w-1.5 h-1.5 bg-[#58CC02] rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-[#58CC02] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-[#58CC02] rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span>Traitement analytique...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Quick Chips */}
            <div className="px-3 pt-2.5 pb-1 border-t border-divider flex flex-wrap gap-1.5 bg-panel-muted/50">
              {getSuggestions().map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(suggestion.query)}
                  className="px-2.5 py-1 text-[10px] font-medium transition-all bg-white hover:bg-slate-50 border border-divider rounded-full shadow-sm hover:border-[#58CC02] cursor-pointer text-slate-700 hover:text-[#58CC02]"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-3 border-t border-divider flex gap-2 bg-panel-muted">
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-divider bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#58CC02]"
                placeholder="Posez votre question contextuelle..."
              />
              <button onClick={() => handleSend()} className="p-2 bg-[#58CC02] text-white rounded-xl cursor-pointer hover:bg-[#46A302] transition-colors flex items-center justify-center">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
