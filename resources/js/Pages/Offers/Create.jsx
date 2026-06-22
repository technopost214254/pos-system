import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';

const inputClass =
    'w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5';

export default function Create({ products = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        type: 'percentage',
        value: '',
        product_id: '',
        starts_at: '',
        ends_at: '',
        active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/offers');
    };

    return (
        <AppLayout>
            <Head title="Add Offer" />
            <PageHeader title="Add Offer" description="Create a new discount offer" />

            <form onSubmit={submit} className="max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Offer Name</label>
                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClass} />
                    {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                    <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows="3" className={inputClass} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Offer Type</label>
                        <select value={data.type} onChange={(e) => setData('type', e.target.value)} className={inputClass}>
                            <option value="percentage">Percentage Discount</option>
                            <option value="fixed">Flat Discount</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            {data.type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
                        </label>
                        <input type="number" value={data.value} onChange={(e) => setData('value', e.target.value)} step="0.01" min="0" className={inputClass} />
                        {errors.value && <p className="mt-1.5 text-sm text-red-600">{errors.value}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Apply To (leave empty for all products)</label>
                    <select value={data.product_id} onChange={(e) => setData('product_id', e.target.value)} className={inputClass}>
                        <option value="">All Products</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
                        <input type="date" value={data.starts_at} onChange={(e) => setData('starts_at', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
                        <input type="date" value={data.ends_at} onChange={(e) => setData('ends_at', e.target.value)} className={inputClass} />
                        {errors.ends_at && <p className="mt-1.5 text-sm text-red-600">{errors.ends_at}</p>}
                    </div>
                </div>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={data.active}
                        onChange={(e) => setData('active', e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">Active</span>
                </label>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
                    >
                        {processing ? 'Saving…' : 'Create Offer'}
                    </button>
                    <Link href="/offers" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                        Cancel
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}
