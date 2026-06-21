import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import { useState } from 'react';

export default function Index({ users }) {
    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleDelete = (id) => {
        if (confirmDelete === id) {
            router.delete(`/users/${id}`);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'outlet', label: 'Outlet', render: (_, row) => row.outlet?.name ?? '—' },
        {
            key: 'can_access_pos',
            label: 'Role',
            align: 'center',
            render: (val) =>
                val ? (
                    <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-2.5 py-0.5 text-xs font-medium">
                        POS Agent
                    </span>
                ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs font-medium">
                        Admin
                    </span>
                ),
        },
        {
            key: 'is_active',
            label: 'Status',
            align: 'center',
            render: (val) =>
                val ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-xs font-medium">Active</span>
                ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2.5 py-0.5 text-xs font-medium">Disabled</span>
                ),
        },
    ];

    const actions = (row) => (
        <div className="space-x-3 flex justify-end">
            <Link
                href={`/users/${row.id}/edit`}
                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
            >
                Edit
            </Link>
            <button
                onClick={() => router.patch(`/users/${row.id}/toggle`)}
                className={`font-medium text-sm transition-colors ${row.is_active ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'}`}
            >
                {row.is_active ? 'Disable' : 'Enable'}
            </button>
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
    );

    return (
        <AppLayout>
            <Head title="Users" />
            <PageHeader
                title="Users"
                description="Manage staff accounts and POS access"
                actionLabel="+ Add User"
                actionHref="/users/create"
            />
            <DataTable columns={columns} data={users.data} actions={actions} links={users.links} />
        </AppLayout>
    );
}
