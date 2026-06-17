import { Link } from '@inertiajs/react';

export default function DataTable({
    columns = [],
    data = [],
    actions = null,
    links = null,
    onDelete = null
}) {
    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-gray-300">
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${
                                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''
                                    }`}
                                >
                                    {col.label}
                                </th>
                            ))}
                            {actions && <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data && data.length > 0 ? (
                            data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    {columns.map(col => (
                                        <td
                                            key={col.key}
                                            className={`px-6 py-4 text-sm text-gray-700 ${
                                                col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''
                                            }`}
                                        >
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-6 py-4 text-right space-x-3 flex justify-end">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {links && (
                <div className="bg-slate-50 px-6 py-4 border-t border-gray-200 flex justify-center gap-2">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                link.active
                                    ? 'bg-blue-900 text-white'
                                    : link.url
                                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
