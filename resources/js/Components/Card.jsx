export default function Card({ children, className = '', title = null, footer = null }) {
    return (
        <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-gray-200 bg-slate-50">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
            {footer && (
                <div className="px-6 py-4 border-t border-gray-200 bg-slate-50">
                    {footer}
                </div>
            )}
        </div>
    );
}
