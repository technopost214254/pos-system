import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';

const inputClass =
    'w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        address: '',
        phone: '',
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/outlets');
    };

    return (
        <AppLayout>
            <Head title="Add Outlet" />
            <PageHeader title="Add Outlet" description="Create a new store outlet" />

            <form onSubmit={submit} className="max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Outlet Name</label>
                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClass} />
                    {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                    <textarea value={data.address} onChange={(e) => setData('address', e.target.value)} rows="3" className={inputClass} />
                    {errors.address && <p className="mt-1.5 text-sm text-red-600">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                        <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className={inputClass} />
                        {errors.phone && <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inputClass} />
                        {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
                    >
                        {processing ? 'Saving…' : 'Create Outlet'}
                    </button>
                    <Link href="/outlets" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                        Cancel
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}
