// app/error.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/index';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="text-center">
        <div className="mb-6 text-6xl">⚠️</div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">Oups! Une erreur s'est produite</h1>

        <p className="mb-6 max-w-md text-gray-600">
          {error.message || "Quelque chose d'inattendu s'est produit. Veuillez réessayer."}
        </p>

        {error.digest && <p className="mb-6 text-xs text-gray-500">Erreur ID: {error.digest}</p>}

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-primary-600 px-6 py-2 font-medium text-white transition-colors hover:bg-primary-700"
          >
            Réessayer
          </button>

          <Link
            href={ROUTES.HOME}
            className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
