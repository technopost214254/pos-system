import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import { useState, useEffect, useRef } from 'react';

export default function Index({ outlets, filters = {} }) {
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const debounceRef = useRef(null);
    const mounted = useRef(false);

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get('/outlets', { search }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    const handleDelete = (id) => {
        if (confirmDelete === id) {
            router.delete(`/outlets/${id}`);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
        }
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
        <div className="space-x-3 flex justify-end">
            <Link href={`/outlets/${row.id}/edit`} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
                Edit
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
    );

    return (
        <AppLayout>
            <Head title="Outlets" />
            <PageHeader
                title="Outlets"
                description="Manage your store outlets"
                search={search}
                onSearch={setSearch}
                searchPlaceholder="Search by name, address or phone..."
                actionLabel="+ Add Outlet"
                actionHref="/outlets/create"
            />
            <DataTable columns={columns} data={outlets.data} actions={actions} links={outlets.links} />
        </AppLayout>
    );
}
