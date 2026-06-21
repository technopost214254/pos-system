<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'type',
        'value',
        'buy_quantity',
        'get_quantity',
        'product_id',
        'active',
        'starts_at',
        'ends_at',
    ];

    protected $casts = [
        'active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function isValid()
    {
        if (!$this->active) return false;
        if ($this->starts_at && now()->isBefore($this->starts_at)) return false;
        if ($this->ends_at && now()->isAfter($this->ends_at)) return false;
        return true;
    }

    public function calculateDiscount($cartItems)
    {
        if (!$this->isValid()) return 0;

        if ($this->type === 'fixed') {
            return min($this->value, $this->getCartTotal($cartItems));
        }

        if ($this->type === 'percentage') {
            return ($this->getCartTotal($cartItems) * $this->value) / 100;
        }

        return 0;
    }

    private function getCartTotal($cartItems)
    {
        return array_sum(array_map(fn($item) => $item['subtotal'], $cartItems));
    }
}
