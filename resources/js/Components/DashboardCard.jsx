import { Link } from '@inertiajs/react';

export default function DashboardCard({ href, icon, title, description, color = 'blue' }) {
    const colorVariants = {
        blue: 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
        green: 'bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
        purple: 'bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
        teal: 'bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800',
        orange: 'bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800',
        indigo: 'bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800',
    };

    return (
        <Link
            href={href}
            className={`block p-8 rounded-lg text-white shadow-lg transition-all transform hover:scale-105 ${colorVariants[color] || colorVariants.blue}`}
        >
            <div className="text-5xl mb-4 opacity-80">{icon}</div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-white/80 text-sm">{description}</p>
        </Link>
    );
}
