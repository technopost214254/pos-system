<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckOutletAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return redirect()->route('pos.login.create');
        }

        // Single-shop POS: an outlet is optional. When the user has an outlet_id,
        // queries scope to it; otherwise the POS operates across all records.
        return $next($request);
    }
}
