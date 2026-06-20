import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import Badge from '@/Components/Badge';

export default function Index({ orders }) {
    const isAdmin = usePage().props.auth?.is_admin;

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
                    <div className="flex gap-2">
                        <Link href={`/orders/${row.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                            View
                        </Link>
                        <Link href={`/orders/${row.id}/invoice`} className="text-gray-700 hover:text-gray-900 font-medium text-sm">
                            🖨️ Print
                        </Link>
                    </div>
                )}
            />
        </AppLayout>
    );
}
