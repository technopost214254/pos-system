import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';

export default function Edit({ permission }) {
    const [formData, setFormData] = useState({
        name: permission.name,
        slug: permission.slug,
        description: permission.description || '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.put(`/admin/permissions/${permission.id}`, formData, {
            onError: (errs) => setErrors(errs),
        });
    };

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Permission</h1>
                    <SecondaryButton href="/admin/permissions">Cancel</SecondaryButton>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                    <div>
                        <InputLabel htmlFor="name" value="Permission Name *" />
                        <TextInput
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="slug" value="Slug *" />
                        <TextInput
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.slug} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="description" value="Description" />
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900"
                        />
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    <div className="flex justify-end">
                        <PrimaryButton type="submit">Update Permission</PrimaryButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
