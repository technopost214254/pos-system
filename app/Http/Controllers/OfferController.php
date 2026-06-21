<?php

namespace App\Http\Controllers;

use App\Models\Offer;
use App\Models\Product;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OfferController extends Controller
{
    public function index(Request $request) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        $query = Offer::where('user_id', $user->id);
        if ($outletId) {
            $query->where(function ($q) use ($outletId) {
                $q->whereNull('product_id')->orWhereHas('product', function ($q2) use ($outletId) {
                    $q2->where('outlet_id', $outletId);
                });
            });
        }

        return Inertia::render('Offers/Index', [
            'offers' => $query->with('product')->paginate(15)
        ]);
    }

    public function create() {
        $user = request()->user();
        $outletId = $user->outlet_id;

        $productQuery = Product::query();
        if ($outletId) {
            $productQuery->where('outlet_id', $outletId);
        }
        $products = $productQuery->get();

        return Inertia::render('Offers/Create', ['products' => $products]);
    }

    public function store(Request $request) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'product_id' => 'nullable|exists:products,id',
            'active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
        ]);

        if ($outletId && !empty($validated['product_id'])) {
            $product = Product::where('id', $validated['product_id'])
                ->where('outlet_id', $outletId)
                ->first();

            if (!$product) {
                return redirect()->back()->withErrors(['product_id' => 'Invalid product for your outlet.']);
            }
        }

        $validated['user_id'] = $user->id;
        Offer::create($validated);

        return redirect()->route('offers.index')->with('success', 'Offer created successfully');
    }

    public function show(Request $request, Offer $offer) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId) {
            $offer->load('product');
            if ($offer->product_id && (!$offer->product || $offer->product->outlet_id !== $outletId)) {
                abort(403);
            }
        }

        return Inertia::render('Offers/Show', ['offer' => $offer]);
    }

    public function edit(Request $request, Offer $offer) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId) {
            $offer->load('product');
            if ($offer->product_id && (!$offer->product || $offer->product->outlet_id !== $outletId)) {
                abort(403);
            }
        }

        $productQuery = Product::query();
        if ($outletId) {
            $productQuery->where('outlet_id', $outletId);
        }
        $products = $productQuery->get();

        return Inertia::render('Offers/Edit', ['offer' => $offer, 'products' => $products]);
    }

    public function update(Request $request, Offer $offer) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId) {
            $offer->load('product');
            if ($offer->product_id && (!$offer->product || $offer->product->outlet_id !== $outletId)) {
                abort(403);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'product_id' => 'nullable|exists:products,id',
            'active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
        ]);

        if ($outletId && !empty($validated['product_id'])) {
            $product = Product::where('id', $validated['product_id'])
                ->where('outlet_id', $outletId)
                ->first();

            if (!$product) {
                return redirect()->back()->withErrors(['product_id' => 'Invalid product for your outlet.']);
            }
        }

        $offer->update($validated);
        return redirect()->route('offers.index')->with('success', 'Offer updated successfully');
    }

    public function destroy(Request $request, Offer $offer) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId) {
            $offer->load('product');
            if ($offer->product_id && $offer->product && $offer->product->outlet_id !== $outletId) {
                abort(403);
            }
        }

        $offer->delete();
        return redirect()->route('offers.index')->with('success', 'Offer deleted successfully');
    }

    public function getAvailableOffers(Request $request) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        $query = Offer::where('user_id', $user->id)
            ->where('active', true)
            ->where(function($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });

        if ($outletId) {
            $query->where(function ($q) use ($outletId) {
                $q->whereNull('product_id')->orWhereHas('product', function ($q2) use ($outletId) {
                    $q2->where('outlet_id', $outletId);
                });
            });
        }

        return $query->with('product')->get();
    }
}