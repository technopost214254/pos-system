import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Link } from '@inertiajs/react';

export default function CreateOffer({ products }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'percentage',
        value: '',
        buy_quantity: 1,
        get_quantity: 1,
        product_id: '',
        active: true,
        starts_at: '',
        ends_at: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData };
        if (payload.type === 'bogo') {
            delete payload.value;
        }
        router.post('/offers', payload, {
            onError: (errors) => setErrors(errors)
        });
    };

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Create Offer</h1>
                    <Link href="/offers" className="text-blue-600 hover:text-blue-900">
                        Back
                    </Link>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Offer Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Summer Sale"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="Offer details..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">Offer Type *</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="percentage">Percentage Discount</option>
                                <option value="fixed">Flat Discount</option>
                                <option value="bogo">Buy One Get One</option>
                            </select>
                        </div>

                        {(formData.type === 'percentage' || formData.type === 'fixed') && (
                            <div>
                                <label className="block text-sm font-semibold mb-1">
                                    {formData.type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'} *
                                </label>
                                <input
                                    type="number"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
                            </div>
                        )}

                        {formData.type === 'bogo' && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Buy Quantity *</label>
                                    <input
                                        type="number"
                                        name="buy_quantity"
                                        value={formData.buy_quantity}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Get Quantity (Free) *</label>
                                    <input
                                        type="number"
                                        name="get_quantity"
                                        value={formData.get_quantity}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-semibold mb-1">Apply To (Leave empty for all products)</label>
                            <select
                                name="product_id"
                                value={formData.product_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Products</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>{product.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Start Date</label>
                                <input
                                    type="date"
                                    name="starts_at"
                                    value={formData.starts_at}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">End Date</label>
                                <input
                                    type="date"
                                    name="ends_at"
                                    value={formData.ends_at}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.ends_at && <p className="text-red-500 text-sm mt-1">{errors.ends_at}</p>}
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="active"
                                checked={formData.active}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label className="ml-2 text-sm font-semibold">Active</label>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
                            >
                                Create Offer
                            </button>
                            <Link
                                href="/offers"
                                className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 font-semibold text-center"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
