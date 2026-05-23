/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, Lock, Mail, User, ShieldAlert, ArrowRight, HelpCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import api from '../api';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAuthHelp, setShowAuthHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await api.login(email, password);
      } else {
        user = await api.register(name, email, password);
      }
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Échec de l\'authentification. Veuillez vérifier vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  // Login instantly using an automatically provisioned anonymous guest account
  const handleAnonymousLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await api.loginAnonymously();
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion anonyme. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth flow
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await api.loginWithGoogle();
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Connexion Google Auth refusée.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-screen-layout" className="min-h-screen bg-base flex items-center justify-center px-4 relative overflow-hidden font-sans">
      <div className="w-full max-w-md space-y-7 relative z-10">
        {/* Brand visual header */}
        <div className="text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-[#58CC02]/10 border-2 border-[#58CC02]/30 flex items-center justify-center text-[#58CC02] mx-auto shadow-sm">
            <Terminal className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-display font-bold text-content tracking-tight mt-4">LearnCraft Hub</h1>
          <p className="text-xs text-content-muted mt-1.5 max-w-xs mx-auto">Maîtrisez des mécanismes avancés TypeScript et le routage industriel Express.</p>
        </div>

        {/* Card Frame wrapping inputs */}
        <div className="bg-panel border-2 border-divider rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Conditional name input if registration layout is active */}
            {!isLogin && (
              <div>
                <label className="text-[10px] text-content-muted uppercase font-bold font-mono block mb-2">Nom Complet</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="auth-name-input"
                    required
                    type="text"
                    placeholder="Sarah Connor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-panel border-2 border-divider text-xs text-content placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#58CC02]/50 focus:border-[#58CC02] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="text-[10px] text-content-muted uppercase font-bold font-mono block mb-2">Adresse E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="auth-email-input"
                  required
                  type="email"
                  placeholder="developpeur@learncraft.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-panel border-2 border-divider text-xs text-content placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#58CC02]/50 focus:border-[#58CC02] transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="text-[10px] text-content-muted uppercase font-bold font-mono block mb-2">Mot de Passe Sécurisé</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="auth-password-input"
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-panel border-2 border-divider text-xs text-content placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#58CC02]/50 focus:border-[#58CC02] transition-colors"
                />
              </div>
            </div>

            {/* Validation error message logs banner if any */}
            {error && (
              <div id="auth-error-log" className="p-3.5 bg-rose-50 border-2 border-rose-200 text-rose-700 rounded-xl text-xs leading-relaxed flex items-start gap-2 select-none">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Primary Submit button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#58CC02] hover:bg-[#46A302] disabled:opacity-55 py-3 font-bold text-xs text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-2 border-[#58CC02] shadow-sm mt-6"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
              ) : (
                <span>{isLogin ? 'Entrer dans l\'Espace' : 'Créer mon Profil'}</span>
              )}
              {!loading && <ArrowRight className="w-3.5 h-3.5 text-white stroke-[2.5px]" />}
            </button>
          </form>

          {/* Google Authentication OAuth Option */}
          <div className="mt-5 space-y-4">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t-2 border-divider"></div>
              <span className="flex-shrink mx-4 text-[9px] text-content-muted font-mono uppercase font-bold tracking-widest bg-panel select-none">ou continuer avec</span>
              <div className="flex-grow border-t-2 border-divider"></div>
            </div>

            <button
              id="google-oauth-btn"
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-panel hover:bg-panel-muted text-content border-2 border-divider hover:border-[#58CC02] py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2.5 font-bold text-xs shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0 animate-none" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuer avec Google</span>
            </button>

            {/* Collapsible Connection Help & Troubleshooting Block */}
            <div className="mt-3 bg-panel-muted border border-divider rounded-xl p-3 text-left">
              <button
                type="button"
                onClick={() => setShowAuthHelp(!showAuthHelp)}
                className="w-full flex items-center justify-between text-[11px] font-bold text-slate-600 hover:text-slate-800 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#58CC02]" />
                  <span>Dépannage & Options de Cookie</span>
                </div>
                {showAuthHelp ? <ChevronUp className="w-3.5 h-3.5 animate-none" /> : <ChevronDown className="w-3.5 h-3.5 animate-none" />}
              </button>

              {showAuthHelp && (
                <div className="mt-2.5 pt-2.5 border-t border-divider text-[10.5px] leading-relaxed text-slate-500 space-y-2.5 font-medium">
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.clear();
                          sessionStorage.clear();
                          const cookies = document.cookie.split(";");
                          for (let i = 0; i < cookies.length; i++) {
                            const cookie = cookies[i];
                            const eqPos = cookie.indexOf("=");
                            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
                          }
                          setError("Succès : Tous les cookies, variables de session et le cache local ont été effacés !");
                        } catch (e: any) {
                          setError("Erreur : " + e.message);
                        }
                      }}
                      className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-700 font-bold text-[10.5px] text-center transition-colors cursor-pointer select-none"
                    >
                      🍪 Effacer tous les cookies et le cache local
                    </button>
                  </div>
                  <p>
                    ⚠️ <strong>Cookies Tiers Bloqués :</strong> Chrome et Safari bloquent la récupération des informations d'identification via l'authentification tierce si l'application est exécutée dans un iframe.
                  </p>
                  <div className="p-2 bg-[#58CC02]/10 border border-[#58CC02]/20 rounded-lg text-emerald-800 font-semibold flex flex-col gap-1">
                    <span>💡 <strong>Solution Facile :</strong> Ouvrez l'application dans un nouvel onglet externe et réessayez !</span>
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#46A302] hover:underline font-extrabold mt-0.5"
                    >
                      Ouvrir l'application dans un nouvel onglet <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="pt-0.5">
                    ⚙️ <strong>Vérification Dashboard Firebase :</strong> Assurez-vous d'avoir explicitement activé la connexion avec <strong>Google Sign-in</strong> dans votre projet Firebase (<em>Authentification ➔ Mode de connexion ➔ Ajouter ➔ Google ➔ Activer</em>).
                  </p>
                  <p>
                    ✅ <strong>Domaines Autorisés :</strong> Nous avons vérifié que vous avez ajouté les noms de domaines autorisés depuis la console Firebase. Merveilleux !
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form Switch and Demo Shortcuts */}
          <div className="mt-6 border-t-2 border-divider pt-5 text-center space-y-4">
            <button
               id="toggle-auth-mode-btn"
              onClick={() => {
                setError(null);
                setIsLogin(!isLogin);
              }}
              className="text-[11px] font-bold text-content-muted hover:text-[#58CC02] transition-colors cursor-pointer select-none"
            >
              {isLogin ? "Nouveau sur la plateforme ? Créez un profil professionnel" : 'Déjà inscrit ? Ouvrez votre session'}
            </button>

            {/* Anonymous connection (Guest mode) option */}
            <div className="pt-2 flex flex-col items-center justify-center gap-2">
              <span className="text-[9px] font-bold text-gray-400 font-mono tracking-widest block uppercase select-none">Pas de compte ? Explorer instantanément</span>
              <button
                id="anonymous-login-btn"
                onClick={handleAnonymousLogin}
                className="w-full px-5 py-3 bg-[#58CC02]/10 hover:bg-[#58CC02]/20 border-2 border-[#58CC02]/40 hover:border-[#58CC02] rounded-xl text-xs font-bold text-[#46A302] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <User className="w-4 h-4 text-[#58CC02] stroke-[2.5]" />
                <span>Connexion Anonyme (Mode Invité)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
