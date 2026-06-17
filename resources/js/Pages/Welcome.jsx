import { Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow text-center">
                <h1 className="text-3xl font-bold text-blue-700 mb-2">🛒 POS System</h1>
                <p className="text-gray-500 mb-6">Point of Sale Management</p>
                <div className="flex gap-4 justify-center">
                    <Link href="/login"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Admin Login
                    </Link>
                    <Link href="/pos/login"
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                        POS Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
