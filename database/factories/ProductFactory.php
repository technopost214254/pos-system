<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use App\Models\Outlet;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'outlet_id' => Outlet::factory(),
            'category_id' => Category::factory(),
            'name' => fake()->unique()->words(2, true),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 50, 5000),
            'stock' => fake()->numberBetween(0, 200),
            'sku' => strtoupper(fake()->unique()->bothify('SKU-###-???')),
            'image' => null,
        ];
    }

    public function forOutlet(Outlet $outlet): static
    {
        return $this->state(fn() => ['outlet_id' => $outlet->id]);
    }

    public function forCategory(Category $category): static
    {
        return $this->state(fn() => ['category_id' => $category->id]);
    }
}
