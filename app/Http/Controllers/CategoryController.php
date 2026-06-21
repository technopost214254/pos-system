<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $categories = Category::withCount('products')
            ->when($user->can_access_pos, fn($q) => $q->where('user_id', $user->id))
            ->latest()
            ->paginate(15);

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        return Inertia::render('Categories/Create');
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $data['user_id'] = $user->id;

        Category::create($data);

        return redirect()->route('categories.index')->with('success', 'Category created.');
    }

    public function edit(Request $request, Category $category)
    {
        $user = $request->user();
        if ($user->can_access_pos && $category->user_id !== $user->id) {
            abort(403);
        }

        return Inertia::render('Categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $user = $request->user();
        if ($user->can_access_pos && $category->user_id !== $user->id) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $category->update($data);

        return redirect()->route('categories.index')->with('success', 'Category updated.');
    }

    public function destroy(Request $request, Category $category)
    {
        $user = $request->user();
        if ($user->can_access_pos && $category->user_id !== $user->id) {
            abort(403);
        }

        $category->delete();

        return redirect()->route('categories.index')->with('success', 'Category deleted.');
    }
}
