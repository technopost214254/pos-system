import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';

const inputClass =
    'w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5';

export default function Create({ outlets = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        outlet_id: '',
        can_access_pos: true,
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/users');
    };

    return (
        <AppLayout>
            <Head title="Add User" />
            <PageHeader title="Add User" description="Create a new staff account" />

            <form onSubmit={submit} className="max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClass} />
                    {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inputClass} />
                    {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                        <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className={inputClass} />
                        {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                        <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} className={inputClass} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Outlet</label>
                    <select value={data.outlet_id} onChange={(e) => setData('outlet_id', e.target.value)} className={inputClass}>
                        <option value="">— No outlet —</option>
                        {outlets.map((o) => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                    </select>
                    {errors.outlet_id && <p className="mt-1.5 text-sm text-red-600">{errors.outlet_id}</p>}
                </div>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">Active <span className="text-slate-400 font-normal">— user can log in to the POS</span></span>
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={data.can_access_pos}
                        onChange={(e) => setData('can_access_pos', e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">POS Agent <span className="text-slate-400 font-normal">— restrict this user to their assigned outlet's data</span></span>
                </label>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
                    >
                        {processing ? 'Saving…' : 'Create User'}
                    </button>
                    <Link href="/users" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                        Cancel
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}
