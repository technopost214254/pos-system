<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use Inertia\Inertia;

class OutletController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $outletId = $user->outlet_id;
        $search = $request->input('search');

        $outlets = Outlet::when($outletId, fn($q) => $q->where('id', $outletId))
            ->when($search, fn($q) => $q->where(function ($q2) use ($search) {
                $q2->where('name', 'like', "%{$search}%")
                   ->orWhere('address', 'like', "%{$search}%")
                   ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate(15);

        return Inertia::render('Outlets/Index', [
            'outlets' => $outlets,
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        return Inertia::render('Outlets/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
        ]);

        $validated['user_id'] = Auth::id();

        Outlet::create($validated);

        return redirect()->route('outlets.index')->with('success', 'Outlet created successfully.');
    }

    public function show(Outlet $outlet)
    {
        return Inertia::render('Outlets/Show', compact('outlet'));
    }

    public function edit(Outlet $outlet)
    {
        return Inertia::render('Outlets/Edit', compact('outlet'));
    }

    public function update(Request $request, Outlet $outlet)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'active' => 'boolean',
        ]);

        $outlet->update($validated);

        return redirect()->route('outlets.index')->with('success', 'Outlet updated successfully.');
    }

    public function destroy(Outlet $outlet)
    {
        try {
            $outlet->delete();
        } catch (QueryException $e) {
            return redirect()->route('outlets.index')->with('error', 'Cannot delete this outlet because it has associated users, products, or orders. Disable it instead.');
        }

        return redirect()->route('outlets.index')->with('success', 'Outlet deleted successfully.');
    }
}