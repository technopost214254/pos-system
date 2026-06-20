<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Customer;
use App\Models\Offer;
use App\Models\Cart;
use App\Models\Outlet;
use App\Models\Order;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PosController extends Controller
{
    public function index(Request $request) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        $offers = Offer::query()
            ->where(function ($q) use ($outletId) {
                if ($outletId) {
                    $q->where(function ($q2) use ($outletId) {
                        $q2->whereNull('product_id')->orWhereHas('product', function ($q3) use ($outletId) {
                            $q3->where('outlet_id', $outletId);
                        });
                    });
                }
            })
            ->where('active', true)
            ->where(function($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->with('product')
            ->get();

        $cartQuery = Cart::with(['items.product'])->where('user_id', $user->id);
        if ($outletId) {
            $cartQuery->where('outlet_id', $outletId);
        }
        $cart = $cartQuery->first();
        $cartItems = [];

        if ($cart) {
            $cartItems = $cart->items->map(function ($item) {
                return [
                    'id' => $item->product_id,
                    'product_id' => $item->product_id,
                    'cart_item_id' => $item->id,
                    'name' => $item->product->name,
                    'price' => (float) $item->unit_price,
                    'qty' => $item->quantity,
                    'subtotal' => (float) $item->subtotal,
                    'stock' => $item->product->stock,
                    'image' => $item->product->image,
                    'image_url' => $item->product->image_url,
                ];
            })->values()->all();
        }

        $productQuery = Product::where('stock', '>', 0);
        if ($outletId) {
            $productQuery->where('outlet_id', $outletId);
        }

        $customerQuery = Customer::query();
        if ($outletId) {
            $customerQuery->where('outlet_id', $outletId);
        }

        return Inertia::render('Pos/Index', [
            'products' => $productQuery->get(['id','name','price','stock','sku','image']),
            'customers' => $customerQuery->get(),
            'offers' => $offers,
            'cart' => $cartItems,
        ]);
    }

    public function dashboard(Request $request) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        $stats = [
            'products' => Product::when($outletId, fn($q) => $q->where('outlet_id', $outletId))->count(),
            'customers' => Customer::when($outletId, fn($q) => $q->where('outlet_id', $outletId))->count(),
            'orders' => Order::when($outletId, fn($q) => $q->where('outlet_id', $outletId))->count(),
            'offers' => Offer::query()
                ->when($outletId, function ($q) use ($outletId) {
                    $q->where(function ($q2) use ($outletId) {
                        $q2->whereNull('product_id')->orWhereHas('product', function ($q3) use ($outletId) {
                            $q3->where('outlet_id', $outletId);
                        });
                    });
                })->count(),
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
        ]);
    }
}
