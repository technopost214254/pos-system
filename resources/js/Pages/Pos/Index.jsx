import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CustomerSelect from '@/Components/CustomerSelect';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';

export default function PosIndex({ products, customers: initialCustomers, offers, cart: initialCart = [] }) {
    const [cart, setCart] = useState(initialCart);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customers, setCustomers] = useState(initialCustomers);
    const [selectedOffer, setSelectedOffer] = useState(null);

    const getCartData = () => JSON.parse(sessionStorage.getItem('pos_cart') || '[]');

    const persistCart = (next) => {
        sessionStorage.setItem('pos_cart', JSON.stringify(next));
        return next;
    };

    const syncCartItem = async (productId, qty) => {
        try {
            const cartData = getCartData();
            const item = cartData.find(i => i.id === productId);

            if (item?.cart_item_id) {
                const res = await fetch(`/cart/items/${item.cart_item_id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({ qty }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    alert(err.error || 'Failed to update cart');
                    await loadCart();
                }
            } else {
                const res = await fetch('/cart/items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({ product_id: productId, qty }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    alert(err.error || 'Failed to add to cart');
                    await loadCart();
                    return;
                }

                const result = await res.json();

                if (result.cart_item_id) {
                    setCart(prev => persistCart(prev.map(i =>
                        i.id === productId ? { ...i, cart_item_id: result.cart_item_id } : i
                    )));
                }
            }
        } catch (error) {
            console.error('Failed to sync cart:', error);
            await loadCart();
        }
    };

    const loadCart = async () => {
        try {
            const response = await fetch('/cart', {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });
            const data = await response.json();
            const next = data.cart || [];
            setCart(next);
            persistCart(next);
        } catch (error) {
            console.error('Failed to load cart:', error);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const addToCart = async (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            const next = existing
                ? prev.map(i => i.id === product.id
                    ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * parseFloat(i.price) }
                    : i)
                : [...prev, { ...product, qty: 1, subtotal: parseFloat(product.price) }];
            return persistCart(next);
        });

        const current = getCartData();
        const item = current.find(i => i.id === product.id);
        await syncCartItem(product.id, item ? item.qty : 1);
    };

    const removeFromCart = async (productId) => {
        const cartData = getCartData();
        const item = cartData.find(i => i.id === productId);
        const cartItemId = item?.cart_item_id;

        setCart(prev => persistCart(prev.filter(i => i.id !== productId)));

        try {
            const res = await fetch(cartItemId ? `/cart/items/${cartItemId}` : '/cart/items', {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            if (!res.ok) {
                alert('Failed to remove item');
                await loadCart();
            }
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            await loadCart();
        }
    };

    const updateQuantity = async (productId, qty) => {
        if (qty <= 0) {
            await removeFromCart(productId);
            return;
        }

        setCart(prev => persistCart(prev.map(i =>
            i.id === productId
                ? { ...i, qty, subtotal: qty * parseFloat(i.price) }
                : i
        )));

        await syncCartItem(productId, qty);
    };

    const subtotal = cart.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);

    const calculateDiscount = () => {
        if (!selectedOffer) return 0;
        const offer = offers.find(o => o.id === selectedOffer);
        if (!offer) return 0;
        if (offer.type === 'fixed') {
            return Math.min(offer.value, subtotal);
        }
        if (offer.type === 'percentage') {
            return (subtotal * offer.value) / 100;
        }
        if (offer.type === 'bogo') {
            let discount = 0;
            for (const item of cart) {
                if (offer.product_id && item.id !== offer.product_id) continue;
                const groupSize = offer.buy_quantity + offer.get_quantity;
                const groups = Math.floor(item.qty / groupSize);
                const remainder = item.qty % groupSize;
                const freeItems = groups * offer.get_quantity + Math.max(0, remainder - offer.buy_quantity);
                discount += freeItems * parseFloat(item.price);
            }
            return discount;
        }
        return 0;
    };

    const discount = calculateDiscount();
    const total = subtotal - discount;

    const proceedToPayment = () => {
        if (!cart.length) return alert('Cart is empty!');
        if (!selectedCustomer) return alert('Please select or create a customer!');

        router.get('/payment', {}, {
            onBefore: () => {
                sessionStorage.setItem('pos_cart', JSON.stringify(cart));
                sessionStorage.setItem('pos_customer', JSON.stringify(selectedCustomer));
                if (selectedOffer) {
                    sessionStorage.setItem('pos_offer', selectedOffer);
                    const offer = offers.find(o => o.id === selectedOffer);
                    sessionStorage.setItem('pos_offer_data', JSON.stringify(offer));
                }
            }
        });
    };

    const getOfferLabel = (offer) => {
        if (offer.type === 'fixed') return `₹${offer.value} off`;
        if (offer.type === 'percentage') return `${offer.value}% off`;
        if (offer.type === 'bogo') return `Buy ${offer.buy_quantity} Get ${offer.get_quantity}`;
        return offer.name;
    };

    return (
        <AppLayout>
            <div className="flex h-[calc(100vh-140px)] gap-6">
                {/* Products Grid */}
                <div className="flex-1 flex flex-col bg-white rounded-lg shadow border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-100 to-slate-50">
                        <h2 className="text-lg font-bold text-gray-900">Products</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-2 gap-4">
                            {products.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => addToCart(p)}
                                    className="bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:scale-105 transition-all group"
                                >
                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{p.name}</h3>
                                    <div className="mt-2 flex justify-between items-end">
                                        <div>
                                            <p className="text-gray-600 text-sm">Stock: {p.stock}</p>
                                            <p className="text-blue-600 font-bold text-lg mt-1">₹{p.price}</p>
                                        </div>
                                        <div className="text-2xl opacity-0 group-hover:opacity-100 transition">➕</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cart */}
                <div className="w-96 flex flex-col bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-100 to-slate-50">
                        <h2 className="text-lg font-bold text-gray-900">Shopping Cart</h2>
                    </div>

                    <div className="flex-1 flex flex-col overflow-y-auto">
                        {/* Customer Selection */}
                        <div className="px-6 py-4 border-b border-gray-200 space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">Customer</label>
                            <CustomerSelect
                                customers={customers}
                                selectedCustomer={selectedCustomer}
                                onSelectCustomer={setSelectedCustomer}
                                onCreateNew={(newCustomer) => setCustomers([...customers, newCustomer])}
                            />
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                            {cart.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-3xl mb-2">🛒</div>
                                    <p>Add items to cart</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="bg-slate-50 rounded-lg p-3 border border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                                                <p className="text-gray-600 text-xs">₹{item.price}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.qty - 1)}
                                                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">-</button>
                                                <span className="px-2 text-sm font-medium">{item.qty}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.qty + 1)}
                                                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">+</button>
                                            </div>
                                            <p className="font-bold text-gray-900 text-sm">₹{item.subtotal.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Offer Section */}
                        {offers.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-b from-orange-50 to-orange-100">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Apply Offer</label>
                                <select
                                    value={selectedOffer || ''}
                                    onChange={(e) => setSelectedOffer(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                                >
                                    <option value="">No Offer</option>
                                    {offers.map(offer => (
                                        <option key={offer.id} value={offer.id}>
                                            {offer.name} - {getOfferLabel(offer)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Totals Section */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-slate-50 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-700">Subtotal</span>
                            <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount</span>
                                <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t pt-3">
                            <span>Total</span>
                            <span className="text-blue-600">₹{total.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={proceedToPayment}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!selectedCustomer || cart.length === 0}
                        >
                            Proceed to Payment →
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
