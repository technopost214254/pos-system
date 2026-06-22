import { Link, router, usePage, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import { useState, useEffect, useRef } from 'react';

export default function CustomerIndex({ customers, filters = {} }) {
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
            router.get('/customers', { search }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [search]);
    const isAdmin = usePage().props.auth?.is_admin;

    const handleDelete = (customerId) => {
        if (confirmDelete === customerId) {
            router.delete(`/customers/${customerId}`);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(customerId);
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email', render: (val) => val || '-' },
        { key: 'address', label: 'Address', render: (val) => val ? val.substring(0, 40) + '...' : '-' },
        ...(isAdmin ? [{ key: 'outlet', label: 'Outlet', render: (_, row) => row.outlet?.name ?? '—' }] : []),
    ];

    const actions = (row) => (
        <div className="space-x-3 flex justify-end">
            <Link
                href={`/customers/${row.id}`}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
            >
                View
            </Link>
            <Link
                href={`/customers/${row.id}/edit`}
                className="text-yellow-600 hover:text-yellow-800 font-medium text-sm transition-colors"
            >
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
            <Head title="Customers" />

            <PageHeader
                title="Customers"
                description="Manage your customer database"
                search={search}
                onSearch={setSearch}
                searchPlaceholder="Search by name, phone or email..."
                actionLabel="+ Add Customer"
                actionHref="/customers/create"
            />
            <DataTable columns={columns} data={customers.data} actions={actions} links={customers.links} />
        </AppLayout>
    );
}
