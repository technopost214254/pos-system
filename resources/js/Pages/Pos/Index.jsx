import { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CustomerSelect from '@/Components/CustomerSelect';

function formatTime() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate() {
    return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PosIndex({ products, customers: initialCustomers, offers, cart: initialCart, categories = [] }) {
    const [cart, setCart] = useState(initialCart);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customers, setCustomers] = useState(initialCustomers);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [clock, setClock] = useState(formatTime());
    const [fullscreen, setFullscreen] = useState(false);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(true);
    const [autoAppliedOffer, setAutoAppliedOffer] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setClock(formatTime()), 30000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handler = () => setFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const loadCart = useCallback(async () => {
        try {
            const res = await fetch('/cart', {
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
            });
            const data = await res.json();
            setCart(data.cart || []);
            persistCart(data.cart || []);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => { loadCart(); }, [loadCart]);

    const getCartData = () => JSON.parse(sessionStorage.getItem('pos_cart') || '[]');
    const persistCart = (next) => { sessionStorage.setItem('pos_cart', JSON.stringify(next)); return next; };

    const syncCartItem = async (productId, qty) => {
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
            const item = getCartData().find(i => i.id === productId);
            if (item?.cart_item_id) {
                const res = await fetch(`/cart/items/${item.cart_item_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                    body: JSON.stringify({ qty }),
                });
                if (!res.ok) { const err = await res.json(); alert(err.error || 'Failed to update'); await loadCart(); }
            } else {
                const res = await fetch('/cart/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                    body: JSON.stringify({ product_id: productId, qty }),
                });
                if (!res.ok) { const err = await res.json(); alert(err.error || 'Failed to add'); await loadCart(); return; }
                const result = await res.json();
                if (result.cart_item_id) {
                    setCart(prev => persistCart(prev.map(i => i.id === productId ? { ...i, cart_item_id: result.cart_item_id } : i)));
                }
            }
        } catch { await loadCart(); }
    };

    const addToCart = async (product) => {
        const cartData = getCartData();
        const existing = cartData.find(i => i.id === product.id);
        const newQty = existing ? existing.qty + 1 : 1;
        const next = existing
            ? cartData.map(i => i.id === product.id ? { ...i, qty: newQty, subtotal: newQty * parseFloat(i.price) } : i)
            : [...cartData, { ...product, qty: 1, subtotal: parseFloat(product.price) }];
        setCart(next);
        persistCart(next);
        await syncCartItem(product.id, newQty);
    };

    const removeFromCart = async (productId) => {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
        const item = getCartData().find(i => i.id === productId);
        const cartItemId = item?.cart_item_id;
        const next = getCartData().filter(i => i.id !== productId);
        setCart(next);
        persistCart(next);
        try {
            const res = await fetch(cartItemId ? `/cart/items/${cartItemId}` : '/cart/items', {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrf },
            });
            if (!res.ok) await loadCart();
        } catch { await loadCart(); }
    };

    const updateQuantity = async (productId, qty) => {
        if (qty <= 0) return removeFromCart(productId);
        const next = getCartData().map(i => i.id === productId ? { ...i, qty, subtotal: qty * parseFloat(i.price) } : i);
        setCart(next);
        persistCart(next);
        await syncCartItem(productId, qty);
    };

    const validOffers = offers.filter(o => o.type === 'fixed' || o.type === 'percentage');

    const subtotal = cart.reduce((s, i) => s + parseFloat(i.subtotal || 0), 0);

    const selectedOfferData = validOffers.find(o => o.id === selectedOffer);

    const calculateItemDiscount = useCallback((item) => {
        if (!selectedOfferData) return 0;
        if (selectedOfferData.product_id && item.id !== selectedOfferData.product_id) return 0;
        const price = parseFloat(item.price);
        const qty = item.qty;
        const lineTotal = qty * price;
        if (selectedOfferData.type === 'fixed') {
            if (selectedOfferData.product_id) {
                return Math.min(selectedOfferData.value, lineTotal);
            }
            const itemShare = (selectedOfferData.value / subtotal) * lineTotal;
            return Math.min(itemShare, lineTotal);
        }
        if (selectedOfferData.type === 'percentage') {
            return (lineTotal * selectedOfferData.value) / 100;
        }
        return 0;
    }, [selectedOfferData, subtotal]);

    const totalDiscount = useMemo(() => {
        if (!selectedOfferData) return 0;
        if (selectedOfferData.type === 'fixed') {
            if (selectedOfferData.product_id) {
                const item = cart.find(i => i.id === selectedOfferData.product_id);
                if (!item) return 0;
                return Math.min(selectedOfferData.value, parseFloat(item.subtotal || item.qty * parseFloat(item.price)));
            }
            return Math.min(selectedOfferData.value, subtotal);
        }
        if (selectedOfferData.type === 'percentage') {
            if (selectedOfferData.product_id) {
                const item = cart.find(i => i.id === selectedOfferData.product_id);
                if (!item) return 0;
                return (parseFloat(item.subtotal || item.qty * parseFloat(item.price)) * selectedOfferData.value) / 100;
            }
            return (subtotal * selectedOfferData.value) / 100;
        }
        return 0;
    }, [selectedOfferData, subtotal, cart]);

    const total = subtotal - totalDiscount;

    const proceedToPayment = () => {
        if (!cart.length) return alert('Cart is empty!');
        if (!selectedCustomer) return alert('Please select a customer!');
        router.get('/payment', { standalone: 1 }, {
            onBefore: () => {
                sessionStorage.setItem('pos_cart', JSON.stringify(cart));
                sessionStorage.setItem('pos_customer', JSON.stringify(selectedCustomer));
                if (selectedOffer) {
                    sessionStorage.setItem('pos_offer', selectedOffer);
                    sessionStorage.setItem('pos_offer_data', JSON.stringify(selectedOfferData));
                }
            }
        });
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    };

    const filteredProducts = useMemo(() =>
        products.filter(p => {
            const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
            return matchesSearch && matchesCategory;
        }),
        [products, searchQuery, selectedCategory]
    );

    // Build a map of product_id -> offers and a flat list of product-specific offers
    const productOffers = useMemo(() => {
        const map = {};
        for (const offer of validOffers) {
            if (offer.product_id) {
                if (!map[offer.product_id]) map[offer.product_id] = [];
                map[offer.product_id].push(offer);
            }
        }
        return map;
    }, [validOffers]);

    const productSpecificOffers = useMemo(() => validOffers.filter(o => o.product_id), [validOffers]);

    // Auto-apply offer when a product with a linked offer is in the cart
    useEffect(() => {
        if (!productSpecificOffers.length) return;
        const cartProductIds = cart.map(i => i.id);
        const matching = productSpecificOffers.find(o => cartProductIds.includes(o.product_id));
        if (matching && selectedOffer !== matching.id && autoAppliedOffer !== false) {
            setSelectedOffer(matching.id);
            setAutoAppliedOffer(true);
        } else if (!matching && selectedOffer && autoAppliedOffer === true) {
            setSelectedOffer(null);
            setAutoAppliedOffer(null);
        }
    }, [cart, productSpecificOffers, selectedOffer, autoAppliedOffer]);

    const offerLabel = (offer) => {
        if (offer.type === 'fixed') return `₹${offer.value} off`;
        if (offer.type === 'percentage') return `${offer.value}% off`;
        return offer.name;
    };

    const renderCartItem = (item) => {
        const itemDiscount = calculateItemDiscount(item);
        const lineTotal = parseFloat(item.subtotal || item.qty * parseFloat(item.price));

        return (
            <div key={item.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">{item.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">₹{parseFloat(item.price).toFixed(2)} each</p>
                    </div>
                    <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 hover:bg-red-600/20 rounded text-red-400 hover:text-red-300 transition-colors shrink-0"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => updateQuantity(item.id, item.qty - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm transition-colors"
                        >
                            −
                        </button>
                        <span className="w-8 text-center font-bold text-white text-sm">{item.qty}</span>
                        <button
                            onClick={() => updateQuantity(item.id, item.qty + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm transition-colors"
                        >
                            +
                        </button>
                    </div>
                    <div className="text-right">
                        {itemDiscount > 0 ? (
                            <>
                                <span className="text-gray-400 text-xs line-through block">₹{lineTotal.toFixed(2)}</span>
                                <span className="font-bold text-green-400 text-sm">₹{(lineTotal - itemDiscount).toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="font-bold text-white text-sm">₹{lineTotal.toFixed(2)}</span>
                        )}
                    </div>
                </div>
                {itemDiscount > 0 && (
                    <div className="mt-1.5 text-xs text-green-400 font-medium">
                        -₹{itemDiscount.toFixed(2)} discount applied
                    </div>
                )}
            </div>
        );
    };

    const content = (
        <div className="flex flex-col h-full">
            {/* Main POS Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Products Area */}
                <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-4 bg-white border-b border-gray-200 shrink-0 flex items-center gap-3">
                        <div className="relative flex-1 max-w-md">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                            <input
                                type="text"
                                placeholder="Search products by name or SKU..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={() => setCartDrawerOpen(!cartDrawerOpen)}
                            className="relative p-2 rounded-lg hover:bg-gray-200 transition-colors shrink-0 flex items-center gap-1.5"
                            title={cartDrawerOpen ? 'Hide cart' : 'Show cart'}
                        >
                            <span className="text-lg">🛒</span>
                            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full">
                                {cart.reduce((s, i) => s + i.qty, 0)}
                            </span>
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-lg shrink-0"
                            title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        >
                            ⛶
                        </button>
                    </div>

                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <div className="px-4 py-2 bg-white border-b border-gray-200 shrink-0 flex items-center gap-2 overflow-x-auto">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                    !selectedCategory
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                        selectedCategory === cat.id
                                            ? 'bg-blue-900 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {filteredProducts.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => addToCart(p)}
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-400 hover:-translate-y-0.5 transition-all group text-left overflow-hidden relative"
                                >
                                    {productOffers[p.id] && (
                                        <span className="absolute top-2 right-2 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                            OFFER
                                        </span>
                                    )}
                                    {p.image ? (
                                        <div className="h-28 bg-gray-100 overflow-hidden">
                                            <img
                                                src={`/storage/${p.image}`}
                                                alt={p.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-28 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-4xl">
                                            📦
                                        </div>
                                    )}
                                    <div className="p-3">
                                        <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                                        <p className="text-gray-400 text-xs mt-0.5">SKU: {p.sku}</p>
                                        <div className="flex items-center justify-between mt-2 gap-1">
                                            <span className="text-lg font-bold text-blue-700 shrink-0">₹{parseFloat(p.price).toFixed(2)}</span>
                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                {p.stock > 10 ? 'In Stock' : p.stock > 0 ? `${p.stock} left` : 'Out'}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="col-span-full text-center py-16 text-gray-400">
                                    <div className="text-5xl mb-4">🔍</div>
                                    <p className="text-lg font-medium">No products found</p>
                                    <p className="text-sm mt-1">Try a different search term</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mini Cart (when drawer is closed) */}
                {!cartDrawerOpen && (
                    <div className="relative">
                        <button
                            onClick={() => setCartDrawerOpen(true)}
                            className="flex flex-col items-center gap-1 bg-gray-900 text-white px-2 py-4 border-l border-gray-700 rounded-l-xl shadow-lg hover:bg-gray-800 transition-colors h-fit mt-20"
                        >
                            <span className="text-xl">🛒</span>
                            <span className="text-xs font-bold bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                {cart.reduce((s, i) => s + i.qty, 0)}
                            </span>
                            <span className="text-[10px] font-semibold text-green-400 whitespace-nowrap">
                                ₹{subtotal.toFixed(0)}
                            </span>
                        </button>
                    </div>
                )}

                {/* Cart Drawer (full sidebar) */}
                {cartDrawerOpen && (
                <div className="w-[400px] flex flex-col bg-gray-900 text-white border-l border-gray-700 shrink-0">
                    {/* Cart drawer header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🛒</span>
                            <span className="font-bold text-sm">Cart</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {fullscreen && (
                                <div className="text-right leading-tight">
                                    <div className="text-[11px] text-gray-400">{formatDate()}</div>
                                    <div className="text-sm font-bold text-white">{clock}</div>
                                </div>
                            )}
                            <button
                                onClick={() => setCartDrawerOpen(false)}
                                className="text-xs text-gray-400 hover:text-white transition-colors p-1"
                                title="Hide cart"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Customer Selection */}
                    <div className="p-4 border-b border-gray-700">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</label>
                        <div className="mt-1.5">
                            <CustomerSelect
                                customers={customers}
                                selectedCustomer={selectedCustomer}
                                onSelectCustomer={setSelectedCustomer}
                                onCreateNew={(newCustomer) => setCustomers([...customers, newCustomer])}
                            />
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Cart Items ({cart.reduce((s, i) => s + i.qty, 0)})</span>
                            {cart.length > 0 && (
                                <button
                                    onClick={async () => {
                                        const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
                                        await fetch('/cart/clear', { method: 'DELETE', headers: { 'X-CSRF-TOKEN': csrf } });
                                        setCart([]);
                                        sessionStorage.removeItem('pos_cart');
                                    }}
                                    className="text-red-400 hover:text-red-300 text-[11px] font-medium"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                        {cart.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-3">🛒</div>
                                <p className="text-sm">Tap a product to add it</p>
                            </div>
                        ) : (
                            cart.map(renderCartItem)
                        )}
                    </div>

                    {/* Offer Selection */}
                    {validOffers.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-700 bg-gray-800/50">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Apply Offer</label>
                            <select
                                value={selectedOffer || ''}
                                onChange={e => { setSelectedOffer(e.target.value ? parseInt(e.target.value) : null); setAutoAppliedOffer(false); }}
                                className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">No Offer</option>
                                {validOffers.map(offer => (
                                    <option key={offer.id} value={offer.id}>
                                        {offer.name} - {offerLabel(offer)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {totalDiscount > 0 && (
                        <div className="px-4 py-2 bg-green-900/40 border-t border-green-800 text-green-300 text-xs flex items-center gap-2">
                            <span>🏷️</span>
                            <span>
                                {selectedOfferData?.type === 'fixed' && `₹${selectedOfferData.value} flat discount applied`}
                                {selectedOfferData?.type === 'percentage' && `${selectedOfferData.value}% discount applied`}
                            </span>
                        </div>
                    )}

                    {/* Totals & Checkout */}
                    <div className="p-4 border-t border-gray-700 bg-gray-800 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Subtotal</span>
                            <span className="font-semibold text-white">₹{subtotal.toFixed(2)}</span>
                        </div>
                        {totalDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-green-400">Discount</span>
                                <span className="font-semibold text-green-400">−₹{totalDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-3">
                            <span className="text-white">Total</span>
                            <span className="text-green-400">₹{total.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={proceedToPayment}
                            disabled={!selectedCustomer || cart.length === 0}
                            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-green-600/20"
                        >
                            Proceed to Payment →
                        </button>
                    </div>
                </div>
                )}
            </div>
        </div>
    );

    const standalone = usePage().url.includes('standalone=1');

    const handleClose = () => {
        const backUrl = sessionStorage.getItem('pos_back_url') || '/dashboard';
        sessionStorage.removeItem('pos_back_url');
        router.visit(backUrl);
    };

    if (standalone) {
        return (
            <div className="fixed inset-0 z-[9999] bg-gray-50 flex flex-col">
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 z-[10000] bg-gray-900/80 text-white text-xs px-2 py-1 rounded hover:bg-gray-900 transition-colors"
                    title="Close POS"
                >
                    ✕ Close
                </button>
                <div className="flex-1 min-h-0">
                    {content}
                </div>
            </div>
        );
    }

    if (fullscreen) {
        return (
            <div className="fixed inset-0 z-[9999] bg-gray-50 flex flex-col">
                {content}
            </div>
        );
    }

    return (
        <AppLayout>
            <Head title="Point of Sale" />
            
            <div className="h-[calc(100vh-90px)] -mx-8 -mb-8">
                {content}
            </div>
        </AppLayout>
    );
}
