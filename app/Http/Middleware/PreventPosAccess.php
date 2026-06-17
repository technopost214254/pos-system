<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventPosAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // POS agents (can_access_pos) are restricted to the terminal and their
        // outlet's data; only admins (agent flag off) may reach management routes.
        if ($user && $user->can_access_pos) {
            return redirect()->route('pos')->with('error', 'POS agents cannot access the management area.');
        }

        return $next($request);
    }
}
