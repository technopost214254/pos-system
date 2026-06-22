import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function CustomerSelect({ customers, selectedCustomer, onSelectCustomer, onCreateNew }) {
    const [search, setSearch] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState(customers);
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
    const [loading, setLoading] = useState(false);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        if (search.trim() === '') {
            setFilteredCustomers(customers);
        } else {
            const query = search.toLowerCase();
            setFilteredCustomers(
                customers.filter(c =>
                    c.name.toLowerCase().includes(query) ||
                    c.phone.includes(query) ||
                    (c.email && c.email.toLowerCase().includes(query))
                )
            );
        }
    }, [search, customers]);

    const handleSearch = async (value) => {
        setSearch(value);
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (value.trim().length > 0) {
            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const response = await fetch(`/customers/search/list?q=${encodeURIComponent(value)}`);
                    const data = await response.json();
                    setFilteredCustomers(data);
                } catch (error) {
                    console.error('Search failed:', error);
                }
            }, 300);
        }
    };

    const handleCreateCustomer = async () => {
        if (!formData.name.trim() || !formData.phone.trim()) {
            alert('Please fill in name and phone');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim() || null,
                address: formData.address.trim() || null,
            };

            const response = await fetch('/customers', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify(payload)
            });

            const text = await response.text();

            if (!response.ok) {
                let message = 'Server error (' + response.status + ': ' + response.statusText + ')';
                try {
                    const data = JSON.parse(text);
                    const errors = data.errors || {};
                    const errorMessage = Object.values(errors).flat().join('\n') || data.message || '';
                    if (errorMessage) message = errorMessage;
                } catch {
                    message = text.slice(0, 300);
                }
                alert('Error creating customer:\n' + message);
                return;
            }

            try {
                const data = JSON.parse(text);
                onCreateNew(data);
                onSelectCustomer(data);
                setFormData({ name: '', phone: '', email: '', address: '' });
                setShowCreateForm(false);
                setIsOpen(false);
                setSearch('');
            } catch {
                alert('Invalid server response');
            }
        } catch (error) {
            console.error('Failed to create customer:', error);
            alert('Failed to create customer: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search or select customer..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        className="border w-full p-2 rounded"
                    />

                    {isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto">
                            {!showCreateForm ? (
                                <>
                                    {filteredCustomers.length > 0 ? (
                                        <>
                                            {filteredCustomers.map(customer => (
                                                <button
                                                    key={customer.id}
                                                    onClick={() => {
                                                        onSelectCustomer(customer);
                                                        setIsOpen(false);
                                                        setSearch('');
                                                    }}
                                                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 border-b ${
                                                        selectedCustomer?.id === customer.id ? 'bg-blue-100' : ''
                                                    }`}
                                                >
                                                    <div className="font-semibold text-gray-900">{customer.name}</div>
                                                    <div className="text-sm text-gray-500">{customer.phone}</div>
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setShowCreateForm(true)}
                                                className="w-full text-left px-4 py-2 text-green-600 font-semibold hover:bg-green-50 border-t"
                                            >
                                                + Add New Customer
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setShowCreateForm(true)}
                                            className="w-full text-left px-4 py-2 text-green-600 font-semibold hover:bg-green-50"
                                        >
                                            + Add New Customer
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="p-4 space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Customer Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="border w-full p-2 rounded text-sm text-gray-700"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="border w-full p-2 rounded text-sm text-gray-700"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email (optional)"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="border w-full p-2 rounded text-sm text-gray-700"
                                    />
                                    <textarea
                                        placeholder="Address (optional)"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="border w-full p-2 rounded text-sm text-gray-700 resize-none"
                                        rows="2"
                                    />
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={handleCreateCustomer}
                                            disabled={loading}
                                            className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400"
                                        >
                                            {loading ? 'Creating...' : 'Create'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowCreateForm(false);
                                                setFormData({ name: '', phone: '', email: '', address: '' });
                                            }}
                                            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded text-sm font-semibold hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {selectedCustomer && (
                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="font-semibold text-blue-900">{selectedCustomer.name}</div>
                    <div className="text-sm text-blue-700">{selectedCustomer.phone}</div>
                    {selectedCustomer.email && (
                        <div className="text-sm text-blue-700">{selectedCustomer.email}</div>
                    )}
                </div>
            )}
        </div>
    );
}
