import { useForm, Link, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';

export default function Show({ order }) {
    const statusForm = useForm({
        status: order.status,
    });

    const submit = (e) => {
        e.preventDefault();
        statusForm.put(`/orders/${order.id}`, {
            onSuccess: () => statusForm.reset(),
        });
    };

    const statusVariants = {
        pending: 'yellow',
        completed: 'green',
        cancelled: 'red',
    };

    const orderDate = new Date(order.created_at).toLocaleString();
    const orderTotal = parseFloat(order.total_amount).toFixed(2);

    return (
        <AppLayout>
            <Head title={`Order #${order.id}`} />

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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                        <p className="text-gray-600 mt-1">{orderDate}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={`/orders/${order.id}/invoice`}
                            className="px-4 py-2 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg text-sm font-medium hover:from-blue-800 hover:to-blue-700 transition-all"
                        >
                            🧾 Invoice
                        </Link>
                        <Link
                            href="/orders"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Back to Orders
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card title="Order Info" className="md:col-span-1">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Customer</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {order.customer?.name || order.customer_name || '—'}
                                </p>
                                {(order.customer?.phone || order.customer_phone) && (
                                    <p className="text-sm text-gray-600">
                                        {order.customer?.phone || order.customer_phone}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Outlet</p>
                                <p className="text-gray-900">{order.outlet?.name || '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Payment</p>
                                <p className="text-gray-900 capitalize">{order.payment_method}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    ₹{orderTotal}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Status" className="md:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">Current Status:</span>
                                <Badge variant={statusVariants[order.status] || 'blue'} className="text-sm px-3 py-1">
                                    {order.status}
                                </Badge>
                            </div>

                            <form onSubmit={submit} className="flex items-center gap-3">
                                <select
                                    value={statusForm.data.status}
                                    onChange={(e) => statusForm.setData('status', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <button
                                    type="submit"
                                    disabled={statusForm.processing || statusForm.data.status === order.status}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg text-sm font-medium hover:from-blue-800 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {statusForm.processing ? 'Updating...' : 'Update'}
                                </button>
                            </form>
                        </div>

                        {statusForm.recentlySuccessful && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-700">Order status updated successfully.</p>
                            </div>
                        )}
                    </Card>
                </div>

                <Card title="Order Items">
                    {order.items && order.items.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                            SKU
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                                            Qty
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                            Unit Price
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {order.items.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {item.product?.name || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {item.product?.sku || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 text-center">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                                ₹{parseFloat(item.unit_price).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                                                ₹{parseFloat(item.subtotal).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No items in this order.</p>
                    )}
                </Card>

                {order.offer && (
                    <Card title="Applied Offer">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-gray-900">{order.offer.name}</p>
                                <p className="text-sm text-gray-600">
                                    {order.offer.type === 'fixed'
                                        ? `₹${order.offer.value} off`
                                        : order.offer.type === 'percentage'
                                        ? `${order.offer.value}% off`
                                        : order.offer.type}
                                </p>
                            </div>
                            {order.discount_amount > 0 && (
                                <p className="text-lg font-bold text-green-600">
                                    -₹{parseFloat(order.discount_amount).toFixed(2)}
                                </p>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
