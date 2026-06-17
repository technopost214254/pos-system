import { Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import Badge from '@/Components/Badge';

export default function Index({ orders }) {
    const isAdmin = usePage().props.auth?.is_admin;
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
            render: (val) => {
                const variants = { pending: 'yellow', completed: 'green', cancelled: 'red' };
                return <Badge variant={variants[val] || 'blue'}>{val}</Badge>;
            }
        },
    ];

    const actions = (row) => (
        <Link href={`/orders/${row.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            View
        </Link>
    );

    return (
        <AppLayout>
            <PageHeader
                title="Orders"
                description="View and manage all orders"
            />
            <DataTable columns={columns} data={orders.data} actions={actions} />
        </AppLayout>
    );
}