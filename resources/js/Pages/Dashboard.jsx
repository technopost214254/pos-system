import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';

const statCards = [
    { key: 'products', label: 'Products', icon: '📦', tone: 'bg-indigo-50 text-indigo-600' },
    { key: 'customers', label: 'Customers', icon: '👥', tone: 'bg-emerald-50 text-emerald-600' },
    { key: 'orders', label: 'Orders', icon: '📋', tone: 'bg-amber-50 text-amber-600' },
    { key: 'offers', label: 'Offers', icon: '🎁', tone: 'bg-rose-50 text-rose-600' },
];

const agentFeatures = [
    { href: '/pos', label: 'POS Terminal', desc: 'Start a new sale', icon: '🛒' },
    { href: '/orders', label: 'Orders', desc: 'View your orders', icon: '📋' },
    { href: '/customers', label: 'Customers', desc: 'Your outlet customers', icon: '👥' },
];

const adminFeatures = [
    { href: '/pos', label: 'POS Terminal', desc: 'Start a new sale', icon: '🛒' },
    { href: '/products', label: 'Products', desc: 'Manage inventory', icon: '📦' },
    { href: '/customers', label: 'Customers', desc: 'Manage customers', icon: '👥' },
    { href: '/orders', label: 'Orders', desc: 'View all orders', icon: '📋' },
    { href: '/users', label: 'Users', desc: 'Manage staff accounts', icon: '👤' },
    { href: '/outlets', label: 'Outlets', desc: 'Manage store outlets', icon: '🏪' },
];

export default function Dashboard({ stats = {} }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.is_admin;
    const features = isAdmin ? adminFeatures : agentFeatures;

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Greeting */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Welcome back, {auth?.user?.name || 'User'} 👋
                    </h1>
                    <p className="text-slate-600 mt-1">Here's an overview of your store.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statCards.map((card) => (
                        <div
                            key={card.key}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4"
                        >
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${card.tone}`}>
                                {card.icon}
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">{stats[card.key] ?? 0}</div>
                                <div className="text-sm text-slate-500">{card.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick access */}
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick access</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f) => (
                            <Link
                                key={f.href}
                                href={f.href}
                                className="group bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-indigo-300 transition-all"
                            >
                                <div className="text-3xl mb-3">{f.icon}</div>
                                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                    {f.label}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">{f.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
