import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import { useState, useEffect, useRef } from 'react';

export default function InvoicesIndex({ orders, filters = {} }) {
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
            router.get('/invoices', { search }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    const columns = [
        { key: 'id', label: 'Invoice #', render: (val) => `#${val}` },
        { key: 'customer_name', label: 'Customer', render: (val, row) => val || row.customer?.name || '—' },
        { key: 'total_amount', label: 'Amount', align: 'center', render: (val) => `₹${parseFloat(val).toFixed(2)}` },
        {
            key: 'created_at',
            label: 'Date',
            align: 'center',
            render: (val) => new Date(val).toLocaleDateString(),
        },
        { key: 'payment_method', label: 'Payment', align: 'center', render: (val) => val?.toUpperCase() },
    ];

    return (
        <AppLayout>
            <Head title="Invoices" />

            <PageHeader
                title="Invoices"
                description="View completed order invoices"
                search={search}
                onSearch={setSearch}
                searchPlaceholder="Search by invoice # or customer..."
            />

            <DataTable
                columns={columns}
                data={orders.data}
                links={orders.links}
                actions={(row) => (
                    <div className="space-x-3 flex justify-end">
                        <Link
                            href={`/orders/${row.id}/invoice`}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                            View Invoice
                        </Link>
                        <Link
                            href={`/orders/${row.id}/invoice?print=1`}
                            className="text-gray-700 hover:text-gray-900 font-medium text-sm"
                        >
                            Print
                        </Link>
                        <Link
                            href={`/orders/${row.id}`}
                            className="text-gray-700 hover:text-gray-900 font-medium text-sm"
                        >
                            Details
                        </Link>
                    </div>
                )}
            />
        </AppLayout>
    );
}