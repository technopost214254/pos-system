import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import FormField from '@/Components/FormField';
import Card from '@/Components/Card';

export default function Edit({ product, outlets = [] }) {
    const { data, setData, put, errors, processing } = useForm({
        name: product.name,
        price: product.price,
        stock: product.stock,
        sku: product.sku,
        description: product.description,
        outlet_id: product.outlet_id ?? ''
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/products/${product.id}`);
    };

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                    <p className="text-gray-600 mt-2">Update product information</p>
                </div>

                <Card>
                    <form onSubmit={submit} className="space-y-6">
                        <FormField
                            label="Product Name *"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            error={errors.name}
                            placeholder="Enter product name"
                        />

                        <FormField
                            label="SKU *"
                            value={data.sku}
                            onChange={e => setData('sku', e.target.value)}
                            error={errors.sku}
                            placeholder="e.g., PROD-001"
                        />

                        <FormField
                            label="Price (₹) *"
                            type="number"
                            step="0.01"
                            value={data.price}
                            onChange={e => setData('price', e.target.value)}
                            error={errors.price}
                            placeholder="Enter product price"
                        />

                        <FormField
                            label="Stock Quantity *"
                            type="number"
                            value={data.stock}
                            onChange={e => setData('stock', e.target.value)}
                            error={errors.stock}
                            placeholder="Enter stock quantity"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Outlet *</label>
                            <select
                                value={data.outlet_id}
                                onChange={e => setData('outlet_id', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                            >
                                <option value="">— Select outlet —</option>
                                {outlets.map(o => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                            </select>
                            {errors.outlet_id && <p className="text-red-500 text-sm mt-2">{errors.outlet_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="Enter product description"
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-2">{errors.description}</p>}
                        </div>

                        <div className="flex gap-4 pt-6 border-t">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg font-medium hover:from-blue-800 hover:to-blue-700 transition-all disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                            <Link
                                href="/products"
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}