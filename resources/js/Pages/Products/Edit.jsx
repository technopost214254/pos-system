import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';

const inputClass =
    'w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5';

export default function Edit({ product, outlets = [], categories = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        name: product.name || '',
        price: product.price || '',
        stock: product.stock || '',
        sku: product.sku || '',
        description: product.description || '',
        outlet_id: product.outlet_id || '',
        category_id: product.category_id || '',
        image: null,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/products/${product.id}`, { forceFormData: true });
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) setData('image', file);
    };

    return (
        <AppLayout>
            <Head title={`Edit Product - ${product.name}`} />
            <PageHeader title="Edit Product" description={`Update ${product.name}`} />

            <form onSubmit={submit} className="max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name</label>
                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClass} />
                    {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">SKU</label>
                    <input type="text" value={data.sku} onChange={(e) => setData('sku', e.target.value)} className={inputClass} />
                    {errors.sku && <p className="mt-1.5 text-sm text-red-600">{errors.sku}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (₹)</label>
                        <input type="number" step="0.01" value={data.price} onChange={(e) => setData('price', e.target.value)} className={inputClass} />
                        {errors.price && <p className="mt-1.5 text-sm text-red-600">{errors.price}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock Quantity</label>
                        <input type="number" value={data.stock} onChange={(e) => setData('stock', e.target.value)} className={inputClass} />
                        {errors.stock && <p className="mt-1.5 text-sm text-red-600">{errors.stock}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Image</label>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {errors.image && <p className="mt-1.5 text-sm text-red-600">{errors.image}</p>}
                    {product.image && (
                        <p className="mt-2 text-xs text-slate-500">Current image uploaded. Upload a new one to replace it.</p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                        <select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} className={inputClass}>
                            <option value="">— Select category —</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.category_id && <p className="mt-1.5 text-sm text-red-600">{errors.category_id}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Outlet</label>
                        <select value={data.outlet_id} onChange={(e) => setData('outlet_id', e.target.value)} className={inputClass}>
                            <option value="">— Select outlet —</option>
                            {outlets.map((o) => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                        {errors.outlet_id && <p className="mt-1.5 text-sm text-red-600">{errors.outlet_id}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                    <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows="4" className={inputClass} />
                    {errors.description && <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
                    >
                        {processing ? 'Saving…' : 'Update Product'}
                    </button>
                    <Link href="/products" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                        Cancel
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}
