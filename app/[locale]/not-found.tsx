// app/not-found.tsx
import Link from 'next/link';
import { ROUTES } from '@/constants/index';

/**
 * 404 page
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="text-center">
        <div className="mb-6 text-8xl font-bold text-primary-600">404</div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">Page non trouvée</h1>

        <p className="mb-8 max-w-md text-gray-600">
          Désolé, la page que vous recherchez n'existe pas ou a été supprimée.
        </p>

        <Link
          href={ROUTES.HOME}
          className="inline-block rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
