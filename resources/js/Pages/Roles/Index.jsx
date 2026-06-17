import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';

export default function Index({ roles }) {
    const columns = [
        { key: 'name', label: 'Role Name' },
        {
            key: 'permissions',
            label: 'Permissions',
            render: (val) => (Array.isArray(val) ? val.length + ' permissions' : '0'),
        },
    ];

    const actions = (row) => (
        <>
            <Link
                href={`/roles/${row.id}/edit`}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
            >
                Edit
            </Link>
        </>
    );

    return (
        <AppLayout>
            <PageHeader
                title="Roles"
                description="Manage roles and permissions"
                actionLabel="+ Add Role"
                actionHref="/roles/create"
            />
            <DataTable columns={columns} data={roles.data} actions={actions} links={roles.links} />
        </AppLayout>
    );
}
