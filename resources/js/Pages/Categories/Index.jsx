import { Link, router, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import Badge from '@/Components/Badge';
import { useState, useEffect, useRef } from 'react';

export default function CategoriesIndex({ categories, filters = {} }) {
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
            router.get('/categories', { search }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    const handleDelete = (id) => {
        if (confirmDelete === id) {
            router.delete(`/categories/${id}`);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        {
            key: 'products_count',
            label: 'Products',
            align: 'center',
            render: (val) => <Badge variant="blue" size="sm">{val}</Badge>
        },
        { key: 'description', label: 'Description', render: (val) => val || '—' },
    ];

    const actions = (row) => (
        <div className="space-x-3 flex justify-end">
            <Link
                href={`/categories/${row.id}/edit`}
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
            <Head title="Categories" />
            <PageHeader
                title="Categories"
                description="Manage product categories"
                search={search}
                onSearch={setSearch}
                searchPlaceholder="Search categories..."
                actionLabel="+ Create Category"
                actionHref="/categories/create"
            />
            <DataTable columns={columns} data={categories.data} actions={actions} links={categories.links} />
        </AppLayout>
    );
}
