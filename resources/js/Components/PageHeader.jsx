import { Link } from '@inertiajs/react';

export default function PageHeader({ title, description = null, action = null, actionLabel = null, actionHref = null, search = null, onSearch = null, searchPlaceholder = 'Search...' }) {
    return (
        <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    {description && <p className="mt-2 text-gray-600">{description}</p>}
                </div>
                <div className="flex items-center gap-3">
                    {onSearch && (
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            <input
                                type="text"
                                value={search || ''}
                                onChange={e => onSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50"
                            />
                        </div>
                    )}
                    {action ? (
                        action
                    ) : actionLabel && actionHref ? (
                        <Link href={actionHref} className="inline-flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
                            {actionLabel}
                        </Link>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
