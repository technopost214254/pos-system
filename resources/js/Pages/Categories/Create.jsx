import { useForm, Link, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import FormField from '@/Components/FormField';
import Card from '@/Components/Card';

export default function Create() {
    const { data, setData, post, errors, processing } = useForm({
        name: '', description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/categories');
    };

    return (
        <AppLayout>
            <Head title="Create Category" />
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Category</h1>
                    <p className="text-gray-600 mt-2">Add a new product category</p>
                </div>
                <Card>
                    <form onSubmit={submit} className="space-y-6">
                        <FormField
                            label="Category Name *"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            error={errors.name}
                            placeholder="e.g., Men, Women, Electronics"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="Optional description"
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
                                {processing ? 'Saving...' : 'Save Category'}
                            </button>
                            <Link
                                href="/categories"
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
