import { Link, router, usePage, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';

export default function Index({ products }) {
    const isAdmin = usePage().props.auth?.is_admin;

    const destroy = (id) => {
        if (confirm('Delete this product?')) router.delete(`/products/${id}`);
    };

    const columns = [
        { key: 'name', label: 'Product Name' },
        { key: 'sku', label: 'SKU', align: 'center' },
        { key: 'price', label: 'Price', align: 'center', render: (val) => `₹${val}` },
        { key: 'stock', label: 'Stock', align: 'center' },
        ...(isAdmin ? [{ key: 'outlet', label: 'Outlet', align: 'center', render: (_, row) => row.outlet?.name ?? '—' }] : []),
    ];

    const actions = (row) => (
        <>
            <Link
                href={`/products/${row.id}/edit`}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
            >
                Edit
            </Link>
            <button
                onClick={() => destroy(row.id)}
                className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
            >
                Delete
            </button>
        </>
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