<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $outletId = $user->outlet_id;

        $cartQuery = Cart::with(['items.product'])->where('user_id', $user->id);
        if ($outletId) {
            $cartQuery->where('outlet_id', $outletId);
        }
        $cart = $cartQuery->firstOrCreate(['user_id' => $user->id, 'outlet_id' => $outletId]);

        $items = $cart->items->map(function ($item) {
            return [
                'id' => $item->product_id,
                'product_id' => $item->product_id,
                'cart_item_id' => $item->id,
                'name' => $item->product->name,
                'price' => (float) $item->unit_price,
                'qty' => $item->quantity,
                'subtotal' => (float) $item->subtotal,
                'stock' => $item->product->stock,
            ];
        })->values()->all();

        return response()->json(['cart' => $items]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $outletId = $user->outlet_id;

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'qty' => 'required|integer|min:1',
        ]);

        if ($outletId) {
            $product = Product::where('id', $request->product_id)
                ->where('outlet_id', $outletId)
                ->firstOrFail();
        } else {
            $product = Product::findOrFail($request->product_id);
        }

        if ($product->stock < $request->qty) {
            return response()->json(['error' => 'Insufficient stock'], 422);
        }

        $cartQuery = Cart::where('user_id', $user->id);
        if ($outletId) {
            $cartQuery->where('outlet_id', $outletId);
        }
        $cart = $cartQuery->firstOrCreate(['user_id' => $user->id, 'outlet_id' => $outletId]);

        $existing = $cart->items()->where('product_id', $product->id)->first();

        if ($existing) {
            $newQty = $existing->quantity + $request->qty;

            if ($product->stock < $newQty) {
                return response()->json(['error' => 'Insufficient stock'], 422);
            }

            $existing->update([
                'quantity' => $newQty,
                'unit_price' => $product->price,
                'subtotal' => $newQty * $product->price,
            ]);

            return response()->json([
                'success' => true,
                'cart_item_id' => $existing->id,
                'qty' => $newQty,
                'subtotal' => (float) $existing->subtotal,
            ]);
        } else {
            $item = $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $request->qty,
                'unit_price' => $product->price,
                'subtotal' => $request->qty * $product->price,
            ]);

            return response()->json([
                'success' => true,
                'cart_item_id' => $item->id,
                'qty' => $item->quantity,
                'subtotal' => (float) $item->subtotal,
            ]);
        }
    }

    public function update(Request $request, CartItem $item)
    {
        $user = $request->user();
        $outletId = $user->outlet_id;

        $request->validate([
            'qty' => 'required|integer|min:1',
        ]);

        $cartQuery = Cart::where('user_id', $user->id);
        if ($outletId) {
            $cartQuery->where('outlet_id', $outletId);
        }
        $cart = $cartQuery->firstOrFail();

        if ($item->cart_id !== $cart->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $product = $item->product;

        if ($product->stock < $request->qty) {
            return response()->json(['error' => 'Insufficient stock'], 422);
        }

        $item->update([
            'quantity' => $request->qty,
            'unit_price' => $product->price,
            'subtotal' => $request->qty * $product->price,
        ]);

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, CartItem $item)
    {
        $user = $request->user();
        $outletId = $user->outlet_id;

        $cartQuery = Cart::where('user_id', $user->id);
        if ($outletId) {
            $cartQuery->where('outlet_id', $outletId);
        }
        $cart = $cartQuery->firstOrFail();

        if ($item->cart_id !== $cart->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $item->delete();

        return response()->json(['success' => true]);
    }

    public function clear(Request $request)
    {
        $user = $request->user();
        $outletId = $user->outlet_id;

        $cartQuery = Cart::where('user_id', $user->id);
        if ($outletId) {
            $cartQuery->where('outlet_id', $outletId);
        }
        $cart = $cartQuery->first();

        if ($cart) {
            $cart->items()->delete();
        }

        return response()->json(['success' => true]);
    }
}
