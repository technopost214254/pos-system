<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        $query = Product::query();
        if ($outletId) {
            $query->where('outlet_id', $outletId);
        }

        return Inertia::render('Products/Index', [
            'products' => $query->with('outlet')->latest()->paginate(10)
        ]);
    }

    public function create(Request $request) {
        return Inertia::render('Products/Create', [
            'outlets' => Outlet::where('user_id', $request->user()->id)->get(['id', 'name']),
        ]);
    }

    public function store(Request $request) {
        $user = $request->user();

        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'sku'   => 'required|unique:products',
            'description' => 'nullable|string',
            'outlet_id' => 'nullable|exists:outlets,id',
        ]);

        $data['user_id'] = $user->id;
        // Agents are pinned to their own outlet; an admin chooses the outlet on the form.
        $data['outlet_id'] = $user->outlet_id ?: ($data['outlet_id'] ?? null);

        Product::create($data);

        return redirect()->route('products.index')->with('success', 'Product created.');
    }

    public function show(Request $request, Product $product) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId && $product->outlet_id !== $outletId) {
            abort(403);
        }

        return Inertia::render('Products/Show', compact('product'));
    }

    public function edit(Request $request, Product $product) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId && $product->outlet_id !== $outletId) {
            abort(403);
        }

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'outlets' => Outlet::where('user_id', $user->id)->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Product $product) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId && $product->outlet_id !== $outletId) {
            abort(403);
        }

        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'sku'   => 'required|unique:products,sku,'.$product->id,
            'description' => 'nullable|string',
            'outlet_id' => 'nullable|exists:outlets,id',
        ]);

        // Agents keep their own outlet; an admin may reassign via the form.
        if ($outletId) {
            $data['outlet_id'] = $outletId;
        }

        $product->update($data);
        return redirect()->route('products.index')->with('success', 'Product updated.');
    }

    public function destroy(Request $request, Product $product) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId && $product->outlet_id !== $outletId) {
            abort(403);
        }

        $product->delete();
        return redirect()->route('products.index')->with('success', 'Product deleted.');
    }
}
