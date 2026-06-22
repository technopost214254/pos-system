<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request) {
        $user = $request->user();
        $outletId = $user->outlet_id;
        $search = $request->input('search');

        $query = Product::query();
        if ($outletId) {
            $query->where('outlet_id', $outletId);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Products/Index', [
            'products' => $query->with(['outlet', 'category'])->latest()->paginate(10),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(Request $request) {
        return Inertia::render('Products/Create', [
            'outlets' => Outlet::where('user_id', $request->user()->id)->get(['id', 'name']),
            'categories' => Category::where('user_id', $request->user()->id)->get(['id', 'name']),
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
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $data['user_id'] = $user->id;
        $data['outlet_id'] = $user->outlet_id ?: ($data['outlet_id'] ?? null);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

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
            'categories' => Category::where('user_id', $user->id)->get(['id', 'name']),
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
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

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
