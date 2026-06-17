import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';

export default function Index({ permissions }) {
    const columns = [
        { key: 'name', label: 'Permission' },
        { key: 'slug', label: 'Slug', align: 'center' },
    ];

    const actions = (row) => (
        <>
            <Link
                href={`/admin/permissions/${row.id}/edit`}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
            >
                Edit
            </Link>
        </>
    );

    return (
        <AppLayout>
            <PageHeader
                title="Permissions"
                description="Manage permissions"
                actionLabel="+ Add Permission"
                actionHref="/admin/permissions/create"
            />
            <DataTable columns={columns} data={permissions.data} actions={actions} links={permissions.links} />
        </AppLayout>
    );
}
