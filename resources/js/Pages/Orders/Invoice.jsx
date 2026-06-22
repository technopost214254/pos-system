import { useEffect } from 'react';
import { router, Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';

export default function Invoice({ order }) {
    const { url } = usePage();
    const isStandalone = url.includes('standalone=1');
    const shouldAutoPrint = url.includes('print=1');

    useEffect(() => {
        if (shouldAutoPrint) {
            const timer = setTimeout(() => window.print(), 600);
            return () => clearTimeout(timer);
        }
    }, [shouldAutoPrint]);

    const orderDate = new Date(order.created_at).toLocaleString();
    const orderTotal = parseFloat(order.total_amount).toFixed(2);

    const content = (
        <>
            <Head title={`Invoice - Order #${order.id}`} />

            <style>{`
                @page { size: A5; margin: 8mm; }
                @media print {
                    body * { visibility: hidden; }
                    .print-receipt, .print-receipt * { visibility: visible; }
                    .print-receipt { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .print-receipt .card-wrapper { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
                    .print-receipt { font-size: 10px; }
                    .print-receipt h1 { font-size: 16px; }
                    .print-receipt table { font-size: 9px; }
                    .print-receipt th { padding: 4px 6px !important; }
                    .print-receipt td { padding: 3px 6px !important; }
                }
            `}</style>

            {isStandalone && (
                <div className="bg-gray-900 text-white px-8 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold">Invoice - Order #{order.id}</span>
                    </div>
                    <span className="text-sm text-gray-400">{orderDate}</span>
                </div>
            )}

            <div className={`flex-1 overflow-y-auto ${isStandalone ? '' : ''}`}>
                <div className={`${isStandalone ? 'p-8' : ''} max-w-2xl mx-auto space-y-6`}>
                    {!isStandalone && (
                        <div className="flex items-center justify-between no-print">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Invoice - Order #{order.id}</h1>
                                <p className="text-gray-600 mt-1 text-sm">{orderDate}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => window.print()}
                                    className="no-print px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-lg text-sm font-medium hover:from-gray-700 hover:to-gray-600 transition-all"
                                >
                                    Print
                                </button>
                                <button
                                    onClick={() => router.get('/pos', { standalone: 1 })}
                                    className="no-print px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Skip
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="print-receipt">
                        <Card className="p-0 overflow-hidden">
                            <div className="bg-white p-5 sm:p-6">
                                <div className="text-center border-b border-gray-200 pb-4 mb-4">
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">INVOICE / RECEIPT</h1>
                                    <p className="text-gray-600 mt-1 text-sm">Order #{order.id}</p>
                                    <p className="text-xs text-gray-500">{orderDate}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-900 uppercase mb-1">From</h3>
                                        <p className="text-sm text-gray-700">{order.outlet?.name || '—'}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-900 uppercase mb-1">Bill To</h3>
                                        <p className="text-sm text-gray-700 font-medium">
                                            {order.customer?.name || order.customer_name || '—'}
                                        </p>
                                        {(order.customer?.phone || order.customer_phone) && (
                                            <p className="text-xs text-gray-600">
                                                {order.customer?.phone || order.customer_phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                                    <table className="w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                                                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Qty</th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Price</th>
                                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {order.items && order.items.length > 0 ? (
                                                order.items.map((item, idx) => (
                                                    <tr key={item.id}>
                                                        <td className="px-3 py-2 text-sm text-gray-900">{idx + 1}</td>
                                                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                                            {item.product?.name || '—'}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-gray-900 text-center">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-gray-900 text-right">
                                                            ₹{parseFloat(item.unit_price).toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm font-semibold text-gray-900 text-right">
                                                            ₹{parseFloat(item.subtotal).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                                                        No items in this order.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end mb-4">
                                    <div className="w-full sm:w-56">
                                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                                            <span className="text-sm text-gray-600">Subtotal</span>
                                            <span className="text-sm font-medium text-gray-900">₹{orderTotal}</span>
                                        </div>
                                        {order.discount_amount > 0 && (
                                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                                                <span className="text-sm text-gray-600">Discount</span>
                                                <span className="text-sm font-medium text-green-600">
                                                    -₹{parseFloat(order.discount_amount).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between py-2 border-t-2 border-gray-300 mt-1">
                                            <span className="text-base font-bold text-gray-900">Total</span>
                                            <span className="text-base font-bold text-blue-600">₹{orderTotal}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-3 flex justify-between items-center gap-4">
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase">Payment</span>
                                        <p className="text-sm font-semibold text-gray-900 capitalize">{order.payment_method}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-medium text-gray-500 uppercase">Status</span>
                                        <p className="text-sm font-semibold capitalize">{order.status}</p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-3 border-t border-gray-200 text-center">
                                    <p className="text-xs text-gray-500">Thank you for your business!</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {isStandalone && (
                        <div className="flex gap-3 no-print">
                            <button
                                onClick={() => window.print()}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-lg font-semibold hover:from-gray-700 hover:to-gray-600 transition-all"
                            >
                                Print
                            </button>
                            <button
                                onClick={() => router.get('/pos', { standalone: 1 })}
                                className="flex-1 px-6 py-3 border border-gray-300 bg-white rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Skip
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    if (isStandalone) {
        return (
            <div className="fixed inset-0 z-[9999] bg-gray-100 flex flex-col">
                {content}
            </div>
        );
    }

    return <AppLayout>{content}</AppLayout>;
}