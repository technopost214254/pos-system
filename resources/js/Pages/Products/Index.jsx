import { Link, router, usePage, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import { useState } from 'react';

export default function Index({ products }) {
    const [confirmDelete, setConfirmDelete] = useState(null);
    const isAdmin = usePage().props.auth?.is_admin;

    const handleDelete = (id) => {
        if (confirmDelete === id) {
            router.delete(`/products/${id}`);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
        }
    };

    const columns = [
        { key: 'name', label: 'Product Name' },
        { key: 'sku', label: 'SKU', align: 'center' },
        { key: 'price', label: 'Price', align: 'center', render: (val) => `₹${val}` },
        { key: 'stock', label: 'Stock', align: 'center' },
        { key: 'category', label: 'Category', align: 'center', render: (_, row) => row.category?.name ?? '—' },
        ...(isAdmin ? [{ key: 'outlet', label: 'Outlet', align: 'center', render: (_, row) => row.outlet?.name ?? '—' }] : []),
    ];

    const actions = (row) => (
        <div className="space-x-3 flex justify-end">
            <Link
                href={`/products/${row.id}/edit`}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
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
            <Head title="Products" />

            <PageHeader
                title="Products"
                description="Manage your product inventory"
                actionLabel="+ Add Product"
                actionHref="/products/create"
            />
            <DataTable columns={columns} data={products.data} actions={actions} links={products.links} />
        </AppLayout>
    );
}