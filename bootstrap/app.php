<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use App\Http\Middleware\HandleInertiaRequests;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Unauthenticated users are sent to the POS login, never the Laravel/Breeze login.
        $middleware->redirectGuestsTo(fn () => route('pos.login.create'));

        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'permission' => \App\Http\Middleware\CheckPermission::class,
            'check.outlet' => \App\Http\Middleware\CheckOutletAccess::class,
            'prevent.pos' => \App\Http\Middleware\PreventPosAccess::class,
            'active.user' => \App\Http\Middleware\EnsureUserIsActive::class,
            'inertia' => \App\Http\Middleware\HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Inertia visits (which carry the X-Inertia header) must never get a JSON
        // exception payload — they need a redirect-back so errors land in the page.
        // Only genuine fetch()/API calls from the POS terminal should receive JSON.
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => ! $request->header('X-Inertia')
                && (
                    $request->is('api/*')
                    || $request->expectsJson()
                    || $request->is('customers')
                    || $request->is('cart/*')
                    || $request->is('offers')
                ),
        );
    })->create();
