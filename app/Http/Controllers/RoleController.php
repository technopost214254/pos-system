<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::where('user_id', Auth::id())
            ->with('permissions')
            ->latest()
            ->paginate(15);

        return Inertia::render('Roles/Index', compact('roles'));
    }

    public function create()
    {
        $permissions = Permission::where('user_id', Auth::id())->get();
        $outlets = Outlet::where('user_id', Auth::id())->get();

        return Inertia::render('Roles/Create', compact('permissions', 'outlets'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:roles,slug',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
            'outlet_id' => 'nullable|exists:outlets,id',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['permissions'] = $validated['permission_ids'] ?? [];

        $role = Role::create($validated);

        if (!empty($validated['permission_ids'])) {
            $role->permissions()->attach($validated['permission_ids']);
        }

        return redirect()->route('roles.index')->with('success', 'Role created successfully.');
    }

    public function show(Role $role)
    {
        $role->load('permissions');
        return Inertia::render('Roles/Show', compact('role'));
    }

    public function edit(Role $role)
    {
        $permissions = Permission::where('user_id', Auth::id())->get();
        $outlets = Outlet::where('user_id', Auth::id())->get();
        $role->load('permissions');

        return Inertia::render('Roles/Edit', compact('role', 'permissions', 'outlets'));
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:roles,slug,' . $role->id,
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
            'outlet_id' => 'nullable|exists:outlets,id',
        ]);

        $validated['permissions'] = $validated['permission_ids'] ?? [];

        $role->update($validated);
        $role->permissions()->sync($validated['permission_ids'] ?? []);

        return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Role deleted successfully.');
    }
}