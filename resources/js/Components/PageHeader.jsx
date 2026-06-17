import { Link } from '@inertiajs/react';

export default function PageHeader({ title, description = null, action = null, actionLabel = null, actionHref = null }) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    {description && <p className="mt-2 text-gray-600">{description}</p>}
                </div>
                {action ? (
                    action
                ) : actionLabel && actionHref ? (
                    <Link href={actionHref} className="inline-flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
                        {actionLabel}
                    </Link>
                ) : null}
            </div>
        </div>
    );
}
