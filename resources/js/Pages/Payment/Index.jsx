import { useState, useEffect } from 'react';
import { router, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/Card';
import Badge from '@/Components/Badge';

export default function PaymentPage() {
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState({});
    const [offerId, setOfferId] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const loadPaymentData = async () => {
            const customerData = sessionStorage.getItem('pos_customer');
            if (customerData) {
                setCustomer(JSON.parse(customerData));
            }

            const offerId = sessionStorage.getItem('pos_offer');
            setOfferId(offerId ? parseInt(offerId) : null);

            try {
                const response = await fetch('/cart', {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                });
                const data = await response.json();
                setCart(data.cart);
            } catch (error) {
                console.error('Failed to load cart:', error);
                setCart(JSON.parse(sessionStorage.getItem('pos_cart') || '[]'));
            }
        };

        loadPaymentData();
    }, []);

    const subtotal = cart.reduce((s, i) => s + parseFloat(i.subtotal), 0);
    const discount = calculateDiscount();
    const total = subtotal - discount;

    function calculateDiscount() {
        if (!offerId) return 0;

        const offerData = sessionStorage.getItem('pos_offer_data');
        if (!offerData) return 0;

        const offer = JSON.parse(offerData);

        const getQualifyingSubtotal = () => {
            if (offer.product_id) {
                const item = cart.find(i => i.id === offer.product_id);
                return item ? parseFloat(item.subtotal || item.qty * parseFloat(item.price)) : 0;
            }
            return subtotal;
        };

        const qualifyingSubtotal = getQualifyingSubtotal();

        if (offer.type === 'fixed') {
            return Math.min(offer.value, qualifyingSubtotal);
        }

        if (offer.type === 'percentage') {
            return (qualifyingSubtotal * offer.value) / 100;
        }

        return 0;
    }

    const placeOrder = () => {
        setProcessing(true);
        router.post('/orders/place', {
            cart,
            customer,
            payment_method: 'cod',
            total_amount: total,
            offer_id: offerId,
            discount_amount: discount,
        }, {
            onSuccess: () => {
                sessionStorage.removeItem('pos_cart');
                sessionStorage.removeItem('pos_customer');
                sessionStorage.removeItem('pos_offer');
                sessionStorage.removeItem('pos_offer_data');
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Payment Confirmation" />
            
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Order Confirmation</h1>
                    <p className="text-gray-600 mt-1">Review and complete your payment</p>
                </div>

                {/* Customer Info */}
                <Card title="Customer Information">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Name</span>
                            <span className="font-semibold text-gray-900">{customer.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Phone</span>
                            <span className="font-semibold text-gray-900">{customer.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email</span>
                            <span className="font-semibold text-gray-900">{customer.email || 'N/A'}</span>
                        </div>
                    </div>
                </Card>

                {/* Order Items */}
                <Card title="Order Items">
                    <div className="space-y-3">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-600">Qty: {item.qty} × ₹{item.price}</p>
                                </div>
                                <p className="font-bold text-gray-900">₹{parseFloat(item.subtotal).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Order Summary */}
                <Card title="Order Summary">
                    <div className="space-y-4">
                        <div className="flex justify-between text-gray-700">
                            <span>Subtotal</span>
                            <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t pt-4 flex justify-between text-2xl font-bold text-gray-900">
                            <span>Total Amount</span>
                            <span className="text-green-600">₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                </Card>

                {/* Payment Method */}
                <Card title="Payment Method">
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-300 rounded-lg">
                        <div className="text-2xl">💵</div>
                        <div className="flex-1">
                            <p className="font-semibold text-green-700">Cash on Delivery (COD)</p>
                            <p className="text-sm text-green-600">Pay when you receive the order</p>
                        </div>
                        <Badge variant="green" size="sm">Selected</Badge>
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => router.get('/pos')}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={placeOrder}
                        disabled={processing}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? '⏳ Placing Order...' : '✓ Confirm & Place Order'}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
