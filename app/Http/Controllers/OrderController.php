<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Cart;
use App\Models\Outlet;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Jobs\ProcessOrderJob;

class OrderController extends Controller
{
    public function index(Request $request) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        $query = Order::with('user', 'items.product', 'customer', 'outlet');
        if ($outletId) {
            $query->where('outlet_id', $outletId);
        }

        return Inertia::render('Orders/Index', [
            'orders' => $query->latest()->paginate(10)
        ]);
    }

    public function show(Request $request, Order $order) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId && $order->outlet_id !== $outletId) {
            abort(403);
        }

        $order->load('items.product', 'user', 'customer');
        return Inertia::render('Orders/Show', compact('order'));
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

        $cartQuery = Cart::where('user_id', $user->id);
        if ($outletId) {
            $cartQuery->where('outlet_id', $outletId);
        }
        $cartQuery->first()?->items()->delete();

        ProcessOrderJob::dispatch(
            $request->cart,
            $request->customer ?? [],
            $request->payment_method,
            $request->total_amount,
            $user->id,
            $outletId,
            $request->offer_id,
            $request->discount_amount
        );

        return redirect()->route('orders.index')
            ->with('success', 'Order placed! Processing in background.');
    }
}
