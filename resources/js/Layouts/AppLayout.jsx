import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const adminNav = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/pos', label: 'POS Terminal', icon: '🛒' },
    { href: '/products', label: 'Products', icon: '📦' },
    { href: '/customers', label: 'Customers', icon: '👥' },
    { href: '/orders', label: 'Orders', icon: '📋' },
    { href: '/users', label: 'Users', icon: '👤' },
    { href: '/outlets', label: 'Outlets', icon: '🏪' },
    { href: '/offers', label: 'Offers', icon: '🎁' },
];

// POS agents are restricted to the terminal and their outlet's orders/customers.
const agentNav = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/pos', label: 'POS Terminal', icon: '🛒' },
    { href: '/orders', label: 'Orders', icon: '📋' },
    { href: '/customers', label: 'Customers', icon: '👥' },
];

export default function AppLayout({ children }) {
    const page = usePage();
    const { auth, flash } = page.props;
    const currentPath = (page.url || '').split('?')[0];
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const isAdmin = auth?.is_admin;
    const navItems = isAdmin ? adminNav : agentNav;
    const isActive = (href) => currentPath === href || currentPath.startsWith(href + '/');
    const initials = (auth?.user?.name || '?').trim().charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 shadow-xl flex flex-col`}>
                <div className="p-4 border-b border-slate-700/60 flex items-center justify-between">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🛒</span>
                            <div className="leading-tight">
                                <div className="font-bold">POS System</div>
                                <div className="text-[11px] text-slate-400">Point of Sale</div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hover:bg-slate-700 p-2 rounded-lg transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav className="p-3 space-y-1 flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                isActive(item.href)
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                            }`}
                            title={item.label}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {sidebarOpen && (
                    <div className="p-4 text-[11px] text-slate-500 border-t border-slate-700/60">
                        &copy; {new Date().getFullYear()} POS System
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
                    <div className="flex items-center justify-end px-8 py-3 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                                {initials}
                            </div>
                            <div className="leading-tight text-right hidden sm:block">
                                <div className="text-sm font-medium text-slate-800">{auth?.user?.name}</div>
                                <div className="text-xs text-slate-500">{auth?.user?.email}</div>
                            </div>
                        </div>
                        <Link
                            href="/pos/logout"
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <span>⎋</span> Logout
                        </Link>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-8">
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                            <span className="text-green-600 font-bold text-lg">✓</span>
                            <p className="text-green-800 font-medium">{flash.success}</p>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <span className="text-red-600 font-bold text-lg">✕</span>
                            <p className="text-red-800 font-medium">{flash.error}</p>
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}
