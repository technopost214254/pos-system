import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import Badge from '@/Components/Badge';
import { useState } from 'react';

export default function Index({ orders }) {
    const [confirmDelete, setConfirmDelete] = useState(null);
    const isAdmin = usePage().props.auth?.is_admin;

    const handleDelete = (id) => {
        if (confirmDelete === id) {
            router.delete(`/orders/${id}`);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
        }
    };

    const statusVariants = {
        pending: 'yellow',
        completed: 'green',
        cancelled: 'red',
    };

    const columns = [
        { key: 'id', label: 'Order #', render: (val) => `#${val}` },
        { key: 'customer_name', label: 'Customer', render: (val, row) => val || row.user?.name },
        ...(isAdmin ? [{ key: 'outlet', label: 'Outlet', render: (_, row) => row.outlet?.name ?? '—' }] : []),
        { key: 'total_amount', label: 'Total', align: 'center', render: (val) => `₹${val}` },
        { key: 'payment_method', label: 'Payment', align: 'center', render: (val) => val?.toUpperCase() },
        {
            key: 'status',
            label: 'Status',
            align: 'center',
            render: (val) => <Badge variant={statusVariants[val] || 'blue'}>{val}</Badge>,
        },
    ];

    return (
        <AppLayout>
            <Head title="Orders" />

            <PageHeader
                title="Orders"
                description="View and manage all orders"
            />

            <DataTable
                columns={columns}
                data={orders.data}
                links={orders.links}
                actions={(row) => (
                    <div className="space-x-3 flex justify-end">
                        <Link href={`/orders/${row.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                            View
                        </Link>
                        <Link href={`/orders/${row.id}/invoice`} className="text-gray-700 hover:text-gray-900 font-medium text-sm">
                            🖨️ Print
                        </Link>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className={`font-medium text-sm transition-colors ${
                                confirmDelete === row.id
                                    ? 'bg-red-600 text-white px-2 py-1 rounded'
                                    : 'text-red-600 hover:text-red-800'
                            }`}
                        >
                            {confirmDelete === row.id ? 'Confirm' : 'Delete'}
                        </button>
                    </div>
                )}
            />
        </AppLayout>
    );
}
