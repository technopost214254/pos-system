<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request) {
        $outletId = $request->user()->outlet_id;
        $search = $request->input('search');

        $query = Customer::query();
        if ($outletId) {
            $query->where('outlet_id', $outletId);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Customer/Index', [
            'customers' => $query->with('outlet')->latest()->paginate(10),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(Request $request) {
        return Inertia::render('Customer/Create', [
            'outlets' => Outlet::where('user_id', $request->user()->id)->get(['id', 'name']),
        ]);
    }

    public function store(Request $request) {
        $user = $request->user();

        $request->merge([
            'email' => $request->input('email') ?: null,
            'address' => $request->input('address') ?: null,
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:customers,phone',
            'email' => 'nullable|email|unique:customers,email',
            'address' => 'nullable|string',
            'outlet_id' => 'nullable|exists:outlets,id',
        ]);

        // Agents are pinned to their own outlet; an admin chooses the outlet on the form.
        $outletId = $user->outlet_id ?: ($validated['outlet_id'] ?? null);
        unset($validated['outlet_id']);

        $customer = Customer::create([
            'user_id' => $user->id,
            'outlet_id' => $outletId,
            ...$validated
        ]);

        // The POS terminal adds customers via fetch() and expects JSON; Inertia
        // pages (Customer/Create) expect a redirect. Distinguish by the X-Inertia header.
        if ($this->expectsJsonApi($request)) {
            return response()->json($customer, 201);
        }

        return redirect()->route('customers.index')->with('success', 'Customer created successfully');
    }

    /**
     * A genuine (non-Inertia) JSON/API request, e.g. the POS terminal's fetch() calls.
     * Inertia visits use axios and set X-Requested-With, so $request->ajax() is not reliable here.
     */
    private function expectsJsonApi(Request $request): bool
    {
        return ! $request->header('X-Inertia')
            && ($request->expectsJson() || $request->header('Accept') === 'application/json');
    }

    public function show(Request $request, Customer $customer) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId && $customer->outlet_id !== $outletId) {
            abort(403);
        }

        return Inertia::render('Customer/Show', [
            'customer' => $customer->load('orders')
        ]);
    }

    public function edit(Request $request, Customer $customer) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId && $customer->outlet_id !== $outletId) {
            abort(403);
        }

        return Inertia::render('Customer/Edit', [
            'customer' => $customer,
            'outlets' => Outlet::where('user_id', $user->id)->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Customer $customer) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId && $customer->outlet_id !== $outletId) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:customers,phone,' . $customer->id,
            'email' => 'nullable|email|unique:customers,email,' . $customer->id,
            'address' => 'nullable|string'
        ]);

        $customer->update($validated);

        return redirect()->route('customers.index')->with('success', 'Customer updated successfully');
    }

    public function destroy(Request $request, Customer $customer) {
        $user = $request->user();
        $outletId = $user->outlet_id;

        if ($outletId && $customer->outlet_id !== $outletId) {
            abort(403);
        }

        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Customer deleted successfully');
    }

    public function search(Request $request) {
        $user = $request->user();
        $outletId = $user->outlet_id;
        $query = $request->input('q', '');

        $customerQuery = Customer::query();
        if ($outletId) {
            $customerQuery->where('outlet_id', $outletId);
        }

        $customers = $customerQuery
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%$query%")
                  ->orWhere('phone', 'like', "%$query%")
                  ->orWhere('email', 'like', "%$query%");
            })
            ->limit(10)
            ->get();

        return response()->json($customers);
    }
}
