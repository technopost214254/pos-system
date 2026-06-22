<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Cart;
use App\Models\Outlet;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request) {
        $user = $request->user();
        $outletId = $user->outlet_id;
        $search = $request->input('search');

        $query = Order::with('user', 'items.product', 'customer', 'outlet');
        if ($outletId) {
            $query->where('outlet_id', $outletId);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($cq) => $cq->where('name', 'like', "%{$search}%"));
            });
        }

        return Inertia::render('Orders/Index', [
            'orders' => $query->latest()->paginate(15),
            'filters' => ['search' => $search],
        ]);
    }

    public function show(Request $request, Order $order) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId && $order->outlet_id !== $outletId) {
            abort(403);
        }

        $order->load('items.product', 'user', 'customer', 'outlet', 'offer');
        return Inertia::render('Orders/Show', compact('order'));
    }

    public function invoice(Request $request, Order $order) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId && $order->outlet_id !== $outletId) {
            abort(403);
        }

        $order->load('items.product', 'user', 'customer', 'outlet', 'offer');
        return Inertia::render('Orders/Invoice', compact('order'));
    }

    public function update(Request $request, Order $order) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId && $order->outlet_id !== $outletId) {
            abort(403);
        }

        $request->validate(['status' => 'required|in:pending,completed,cancelled']);
        $order->update(['status' => $request->status]);
        return back()->with('success', 'Order status updated.');
    }

    public function destroy(Request $request, Order $order) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId && $order->outlet_id !== $outletId) {
            abort(403);
        }

        $order->delete();
        return redirect()->route('orders.index');
    }

    public function place(Request $request) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        $request->validate([
            'cart'           => 'required|array|min:1',
            'payment_method' => 'required|in:cod',
            'total_amount'   => 'required|numeric|min:0',
            'offer_id'       => 'nullable|exists:offers,id',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        $order = DB::transaction(function () use ($request, $user, $outletId) {
            $order = Order::create([
                'user_id'        => $user->id,
                'outlet_id'      => $outletId,
                'customer_id'    => $request->customer['id'] ?? null,
                'customer_name'  => $request->customer['name'] ?? null,
                'customer_phone' => $request->customer['phone'] ?? null,
                'payment_method' => $request->payment_method,
                'payment_status' => 'paid',
                'status'         => 'completed',
                'total_amount'   => $request->total_amount,
                'offer_id'       => $request->offer_id,
                'discount_amount' => $request->discount_amount ?? 0,
            ]);

            foreach ($request->cart as $item) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $item['id'],
                    'quantity'   => $item['qty'],
                    'unit_price' => $item['price'],
                    'subtotal'   => $item['subtotal'],
                ]);

                Product::where('id', $item['id'])
                    ->decrement('stock', $item['qty']);
            }

            return $order;
        });

        $cartQuery = Cart::where('user_id', $user->id);
        if ($outletId) {
            $cartQuery->where('outlet_id', $outletId);
        }
        $cartQuery->first()?->items()->delete();

        return redirect()->route('orders.invoice', ['order' => $order->id, 'print' => 1, 'standalone' => 1])
            ->with('success', 'Order placed successfully!');
    }
}
