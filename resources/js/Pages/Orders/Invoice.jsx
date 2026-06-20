import { Link, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';

export default function Invoice({ order }) {
    const statusVariants = {
        pending: 'yellow',
        completed: 'green',
        cancelled: 'red',
    };

    const orderDate = new Date(order.created_at).toLocaleString();
    const orderTotal = parseFloat(order.total_amount).toFixed(2);

    return (
        <AppLayout>
            <Head title={`Invoice - Order #${order.id}`} />

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-receipt, .print-receipt * { visibility: visible; }
                    .print-receipt { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                    .no-print { display: none !important; }
                    .print-receipt .bg-white { box-shadow: none; border: 1px solid #e5e7eb; }
                }
            `}</style>

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between no-print">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Invoice - Order #{order.id}</h1>
                        <p className="text-gray-600 mt-1">{orderDate}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-lg text-sm font-medium hover:from-gray-700 hover:to-gray-600 transition-all"
                        >
                            🖨️ Print
                        </button>
                        <Link
                            href={`/orders/${order.id}`}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Back to Order
                        </Link>
                    </div>
                </div>

                <div className="print-receipt">
                    <Card className="p-0 overflow-hidden">
                        <div className="bg-white p-6 sm:p-8">
                            <div className="text-center border-b border-gray-200 pb-6 mb-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">INVOICE / RECEIPT</h1>
                                <p className="text-gray-600 mt-1">Order #{order.id}</p>
                                <p className="text-sm text-gray-500">{orderDate}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase mb-2">From</h3>
                                    <p className="text-sm text-gray-700">{order.outlet?.name || '—'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase mb-2">Bill To</h3>
                                    <p className="text-sm text-gray-700 font-medium">
                                        {order.customer?.name || order.customer_name || '—'}
                                    </p>
                                    {(order.customer?.phone || order.customer_phone) && (
                                        <p className="text-sm text-gray-600">
                                            {order.customer?.phone || order.customer_phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Qty</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Price</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {order.items && order.items.length > 0 ? (
                                                order.items.map((item, idx) => (
                                                    <tr key={item.id}>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                            {item.product?.name || '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                                            ₹{parseFloat(item.unit_price).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
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
                            </div>

                            <div className="flex justify-end mb-6">
                                <div className="w-full sm:w-64">
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Subtotal</span>
                                        <span className="text-sm font-medium text-gray-900">₹{orderTotal}</span>
                                    </div>
                                    {order.discount_amount > 0 && (
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm text-gray-600">Discount</span>
                                            <span className="text-sm font-medium text-green-600">
                                                -₹{parseFloat(order.discount_amount).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-3 border-t-2 border-gray-300 mt-2">
                                        <span className="text-base font-bold text-gray-900">Total</span>
                                        <span className="text-base font-bold text-blue-600">₹{orderTotal}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase">Payment Method</span>
                                    <p className="text-sm font-semibold text-gray-900 capitalize">{order.payment_method}</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <span className="text-xs font-medium text-gray-500 uppercase">Status</span>
                                    <p className="text-sm font-semibold capitalize">{order.status}</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-gray-200 text-center">
                                <p className="text-xs text-gray-500">Thank you for your business!</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
