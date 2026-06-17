import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';

export default function Create({ permissions, outlets }) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        permission_ids: [],
        outlet_id: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'permission_ids') {
            setFormData((prev) => ({
                ...prev,
                permission_ids: checked
                    ? [...prev.permission_ids, parseInt(value)]
                    : prev.permission_ids.filter((id) => id !== parseInt(value)),
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post('/admin/roles', formData, {
            onError: (errs) => setErrors(errs),
        });
    };

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Create Role</h1>
                    <SecondaryButton href="/admin/roles">Cancel</SecondaryButton>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                    <div>
                        <InputLabel htmlFor="name" value="Role Name *" />
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
                        <InputLabel htmlFor="outlet_id" value="Outlet (optional)" />
                        <select
                            id="outlet_id"
                            name="outlet_id"
                            value={formData.outlet_id}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900"
                        >
                            <option value="">None (Global)</option>
                            {outlets.map((outlet) => (
                                <option key={outlet.id} value={outlet.id}>
                                    {outlet.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.outlet_id} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel value="Permissions" />
                        <div className="mt-2 space-y-2">
                            {permissions.map((permission) => (
                                <label key={permission.id} className="flex items-center">
                                    <Checkbox
                                        name="permission_ids"
                                        value={permission.id}
                                        checked={formData.permission_ids.includes(permission.id)}
                                        onChange={handleChange}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{permission.name}</span>
                                </label>
                            ))}
                        </div>
                        <InputError message={errors.permission_ids} className="mt-2" />
                    </div>

                    <div className="flex justify-end">
                        <PrimaryButton type="submit">Create Role</PrimaryButton>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
