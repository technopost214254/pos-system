import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

const adminNav = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    {
        label: 'Catalog',
        icon: '📁',
        children: [
            { href: '/products', label: 'Products', icon: '📦' },
            { href: '/categories', label: 'Categories', icon: '📂' },
        ],
    },
    {
        label: 'Sales',
        icon: '💰',
        children: [
            { href: '/orders', label: 'Orders', icon: '📋' },
            { href: '/invoices', label: 'Invoices', icon: '🧾' },
        ],
    },
    { href: '/customers', label: 'Customers', icon: '👥' },
    { 
        href: '/settings', 
        label: 'Settings', 
        icon: '⚙️',
        children: [
            { href: '/users', label: 'Users', icon: '👤' },
            { href: '/outlets', label: 'Outlets', icon: '🏪' },
            { href: '/offers', label: 'Offers', icon: '🎁' },
        ],
    },
];

// POS agents are restricted to the terminal and their outlet's orders/customers.
const agentNav = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/orders', label: 'Orders', icon: '📋' },
    { href: '/customers', label: 'Customers', icon: '👥' },
];

function CatalogSection({ item, sidebarOpen, isActive }) {
    const [open, setOpen] = useState(true);
    const childActive = item.children.some((c) => isActive(c.href));

    if (!sidebarOpen) {
        return (
            <div className="space-y-1">
                <div className="flex items-center justify-center px-3 py-2.5 text-slate-400 text-lg">
                    <span>{item.icon}</span>
                </div>
                {item.children.map((child) => (
                    <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center justify-center px-3 py-2.5 rounded-lg transition-colors ${
                            isActive(child.href)
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                        }`}
                        title={child.label}
                    >
                        <span className="text-lg">{child.icon}</span>
                    </Link>
                ))}
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    childActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:bg-slate-700/70 hover:text-white'
                }`}
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                </div>
                <span className={`text-xs transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
            </button>
            {open && (
                <div className="ml-4 mt-1 space-y-1 border-l border-slate-700/40 pl-2">
                    {item.children.map((child) => (
                        <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                isActive(child.href)
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'
                            }`}
                            title={child.label}
                        >
                            <span className="text-base">{child.icon}</span>
                            <span className="text-sm">{child.label}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

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
        <div className="h-screen bg-slate-50 flex overflow-hidden">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 shadow-xl flex flex-col shrink-0`}>
                <div className="p-4 border-b border-slate-700/60 flex items-center justify-between shrink-0">
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

                <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
                    {navItems.map((item) =>
                        item.children ? (
                            <CatalogSection
                                key={item.label}
                                item={item}
                                sidebarOpen={sidebarOpen}
                                isActive={isActive}
                            />
                        ) : (
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
                        )
                    )}
                </nav>

                {sidebarOpen && (
                    <div className="p-4 text-[11px] text-slate-500 border-t border-slate-700/60 shrink-0">
                        &copy; {new Date().getFullYear()} POS System
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10 shrink-0">
                    <div className="flex items-center justify-between px-8 py-3 gap-4">
                        <span
                            onClick={() => {
                                sessionStorage.setItem('pos_back_url', window.location.pathname + window.location.search);
                                router.visit('/pos?standalone=1');
                            }}
                            className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-black hover:text-indigo-700 transition-colors hover:underline"
                        >
                            <span className="text-lg">🛒</span>
                            POS Terminal
                        </span>

                        <div className="flex items-center gap-4">
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
