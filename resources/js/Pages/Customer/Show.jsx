import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function CustomerShow({ customer }) {
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                    <div className="flex gap-4">
                        <Link href={`/customers/${customer.id}/edit`}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">
                            Edit
                        </Link>
                        <Link href="/customers"
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                            Back to Customers
                        </Link>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Customer Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Phone</p>
                            <p className="text-lg text-gray-900">{customer.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Email</p>
                            <p className="text-lg text-gray-900">{customer.email || '-'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm font-medium text-gray-600">Address</p>
                            <p className="text-lg text-gray-900">{customer.address || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Registered</p>
                            <p className="text-lg text-gray-900">{new Date(customer.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Order History */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Order History</h2>
                    {customer.orders && customer.orders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customer.orders.map(order => (
                                        <tr key={order.id} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                ₹{parseFloat(order.total_amount).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    order.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : order.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    order.payment_status === 'paid'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {order.payment_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No orders yet.</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
