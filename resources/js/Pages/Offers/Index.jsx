import { Link, router, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import Badge from '@/Components/Badge';
import { useState } from 'react';

export default function OffersIndex({ offers }) {
    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleDelete = (offerId) => {
        if (confirmDelete === offerId) {
            router.delete(`/offers/${offerId}`);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(offerId);
        }
    };

    const getTypeLabel = (type) => {
        return {
            'fixed': 'Flat Discount',
            'percentage': 'Percentage',
        }[type] || type;
    };

    const getOfferDisplay = (offer) => {
        if (offer.type === 'fixed') return `₹${offer.value}`;
        if (offer.type === 'percentage') return `${offer.value}%`;
        return '-';
    };

    const columns = [
        { key: 'name', label: 'Offer Name' },
        { key: 'type', label: 'Type', render: (val) => getTypeLabel(val) },
        { key: 'value', label: 'Value', align: 'center', render: (val, row) => getOfferDisplay(row) },
        { key: 'product_id', label: 'Product', render: (val, row) => row.product?.name || 'All Products' },
        {
            key: 'active',
            label: 'Status',
            align: 'center',
            render: (val) => <Badge variant={val ? 'green' : 'red'}>{val ? 'Active' : 'Inactive'}</Badge>
        },
    ];

    const actions = (row) => (
        <div className="space-x-3 flex justify-end">
            <Link
                href={`/offers/${row.id}/edit`}
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
            <Head title="Offers & Discounts" />
            
            <PageHeader
                title="Offers & Discounts"
                description="Manage promotional offers"
                actionLabel="+ Create Offer"
                actionHref="/offers/create"
            />
            <DataTable columns={columns} data={offers.data} actions={actions} links={offers.links} />
        </AppLayout>
    );
}
