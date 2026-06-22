<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use App\Models\Outlet;
use App\Models\Customer;
use App\Models\Offer;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $status = fake()->randomElement(['completed', 'completed', 'completed', 'pending', 'cancelled']);

        return [
            'user_id' => User::factory(),
            'outlet_id' => Outlet::factory(),
            'customer_id' => Customer::factory(),
            'customer_name' => fake()->name(),
            'customer_phone' => fake()->phoneNumber(),
            'status' => $status,
            'payment_method' => fake()->randomElement(['cash', 'card', 'upi', 'cod']),
            'payment_status' => $status === 'completed' ? 'paid' : 'unpaid',
            'total_amount' => 0,
            'discount_amount' => 0,
            'offer_id' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn() => [
            'status' => 'completed',
            'payment_status' => 'paid',
        ]);
    }

    public function forOutlet(Outlet $outlet): static
    {
        return $this->state(fn() => ['outlet_id' => $outlet->id]);
    }

    public function forCustomer(?Customer $customer = null): static
    {
        return $this->state(fn() => [
            'customer_id' => $customer?->id ?? Customer::factory(),
            'customer_name' => $customer?->name ?? fake()->name(),
            'customer_phone' => $customer?->phone ?? fake()->phoneNumber(),
        ]);
    }
}
