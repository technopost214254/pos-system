<?php

namespace Database\Factories;

use App\Models\OrderItem;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        $qty = fake()->numberBetween(1, 5);
        $unitPrice = fake()->randomFloat(2, 50, 2000);

        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'quantity' => $qty,
            'unit_price' => $unitPrice,
            'subtotal' => $qty * $unitPrice,
        ];
    }

    public function forOrder(Order $order): static
    {
        return $this->state(fn() => ['order_id' => $order->id]);
    }

    public function forProduct(Product $product): static
    {
        $unitPrice = $product->price;

        return $this->state(fn() => [
            'product_id' => $product->id,
            'unit_price' => $unitPrice,
            'subtotal' => $unitPrice,
        ]);
    }
}
