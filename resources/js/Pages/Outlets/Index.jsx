import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';

export default function Index({ outlets }) {
    const destroy = (id) => {
        if (confirm('Delete this outlet?')) router.delete(`/outlets/${id}`);
    };

    const columns = [
        { key: 'name', label: 'Outlet Name' },
        { key: 'address', label: 'Address' },
        { key: 'phone', label: 'Phone', align: 'center' },
        {
            key: 'active',
            label: 'Status',
            align: 'center',
            render: (val) =>
                val ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-xs font-medium">Active</span>
                ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 px-2.5 py-0.5 text-xs font-medium">Inactive</span>
                ),
        },
    ];

    const actions = (row) => (
        <>
            <Link href={`/outlets/${row.id}/edit`} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
                Edit
            </Link>
            <button onClick={() => destroy(row.id)} className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors">
                Delete
            </button>
        </>
    );

    return (
        <AppLayout>
            <Head title="Outlets" />
            <PageHeader
                title="Outlets"
                description="Manage your store outlets"
                actionLabel="+ Add Outlet"
                actionHref="/outlets/create"
            />
            <DataTable columns={columns} data={outlets.data} actions={actions} links={outlets.links} />
        </AppLayout>
    );
}
