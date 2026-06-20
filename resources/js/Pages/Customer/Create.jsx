import { Link, useForm, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import FormField from '@/Components/FormField';
import Card from '@/Components/Card';

export default function CustomerCreate({ outlets = [] }) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        outlet_id: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/customers');
    };

    return (
        <AppLayout>
            <Head title="Create Customers" />

            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
                    <p className="text-gray-600 mt-2">Create a new customer in your system</p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormField
                            label="Full Name *"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            error={errors.name}
                            placeholder="Enter customer name"
                        />

                        <FormField
                            label="Phone Number *"
                            type="tel"
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            error={errors.phone}
                            placeholder="Enter phone number"
                        />

                        <FormField
                            label="Email"
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            error={errors.email}
                            placeholder="Enter email address"
                        />

                        {outlets.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Outlet</label>
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
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <textarea
                                value={data.address}
                                onChange={e => setData('address', e.target.value)}
                                placeholder="Enter customer address"
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                            />
                            {errors.address && <p className="text-red-500 text-sm mt-2">{errors.address}</p>}
                        </div>

                        <div className="flex gap-4 pt-6 border-t">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg font-medium hover:from-blue-800 hover:to-blue-700 transition-all disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Create Customer'}
                            </button>
                            <Link
                                href="/customers"
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
