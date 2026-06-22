<?php

namespace Database\Factories;

use App\Models\Offer;
use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class OfferFactory extends Factory
{
    protected $model = Offer::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['fixed', 'percentage']);

        return [
            'user_id' => User::factory(),
            'name' => fake()->unique()->words(3, true),
            'description' => fake()->sentence(),
            'type' => $type,
            'value' => $type === 'percentage' ? fake()->numberBetween(5, 50) : fake()->randomFloat(2, 50, 500),
            'product_id' => null,
            'active' => true,
            'starts_at' => fake()->dateTimeBetween('-1 month'),
            'ends_at' => fake()->dateTimeBetween('+1 month', '+3 months'),
        ];
    }

    public function forProduct(Product $product): static
    {
        return $this->state(fn() => ['product_id' => $product->id]);
    }

    public function percentage(): static
    {
        return $this->state(fn() => [
            'type' => 'percentage',
            'value' => fake()->numberBetween(5, 50),
        ]);
    }

    public function fixed(): static
    {
        return $this->state(fn() => [
            'type' => 'fixed',
            'value' => fake()->randomFloat(2, 50, 500),
        ]);
    }
}
