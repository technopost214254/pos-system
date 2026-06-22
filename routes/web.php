<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OutletController;
use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (Auth::guard('pos')->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('pos.login.create');
})->name('home');

// ==================== POS AUTH ====================
Route::prefix('pos')->name('pos.')->group(function () {
    Route::get('login', [\App\Http\Controllers\Auth\PosLoginController::class, 'create'])->name('login.create');
    Route::post('login', [\App\Http\Controllers\Auth\PosLoginController::class, 'store'])->name('login.store');
});

Route::middleware('auth:pos')->group(function () {
    Route::post('pos/logout', [\App\Http\Controllers\Auth\PosLoginController::class, 'destroy'])
        ->name('pos.logout');

    Route::middleware(['inertia', 'check.outlet', 'active.user'])->group(function () {
        Route::get('/dashboard', [PosController::class, 'dashboard'])->name('dashboard');
        Route::get('/pos', [PosController::class, 'index'])->name('pos');
        Route::get('/payment', [PaymentController::class, 'index'])->name('payment');
        Route::post('/orders/place', [OrderController::class, 'place'])->name('orders.place');

        // Shared — both admins and POS agents (data is outlet-scoped per user)
        Route::get('/customers/search/list', [CustomerController::class, 'search'])->name('customers.search');
        Route::get('/products/find-by-sku/{sku}', [ProductController::class, 'findBySku'])->name('products.find-by-sku');
        Route::resource('customers', CustomerController::class);
        Route::resource('orders', OrderController::class)->except(['create','store','edit']);
        Route::get('orders/{order}/invoice', [OrderController::class, 'invoice'])->name('orders.invoice');
        Route::get('/invoices', [OrderController::class, 'invoices'])->name('invoices');
        Route::get('/offers/available/list', [OfferController::class, 'getAvailableOffers'])->name('offers.available');

        Route::prefix('cart')->name('cart.')->group(function () {
            Route::get('/', [CartController::class, 'index'])->name('index');
            Route::post('/items', [CartController::class, 'store'])->name('items.store');
            Route::put('/items/{item}', [CartController::class, 'update'])->name('items.update');
            Route::delete('/items/{item}', [CartController::class, 'destroy'])->name('items.destroy');
            Route::delete('/clear', [CartController::class, 'clear'])->name('clear');
        });

        // Admin-only — POS agents are redirected away by prevent.pos
        Route::middleware('prevent.pos')->group(function () {
            Route::resource('products', ProductController::class)->except(['show']);
            Route::resource('users', UserController::class)->except(['show']);
            Route::patch('users/{user}/toggle', [UserController::class, 'toggle'])->name('users.toggle');
            Route::resource('outlets', OutletController::class)->except(['show']);
            Route::resource('offers', OfferController::class)->except(['show']);
            Route::resource('categories', CategoryController::class)->except(['show']);
        });
    });
});
