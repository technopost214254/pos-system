<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Outlet;
use App\Models\Category;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Offer;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('admin123'),
                'can_access_pos' => false,
                'is_active' => true,
            ],
        );

        $users = User::factory(19)->create();
        $allUsers = $users->prepend($admin);

        $outlets = Outlet::factory(20)
            ->recycle($allUsers)
            ->create();

        $agents = $allUsers->slice(1, 10)->values();
        $agentOutlets = $outlets->random($agents->count())->values();
        $agents->each(fn($user, $i) => $user->update([
            'outlet_id' => $agentOutlets->get($i)->id,
            'can_access_pos' => true,
        ]));

        $categories = Category::factory(20)
            ->recycle($admin)
            ->create([
                'user_id' => $admin->id,
            ]);

        $products = Product::factory(20)
            ->recycle($admin)
            ->recycle($outlets)
            ->recycle($categories)
            ->create();

        $customers = Customer::factory(20)
            ->recycle($admin)
            ->recycle($outlets)
            ->create();

        $offers = Offer::factory(20)
            ->recycle($admin)
            ->create();

        $offers->random(floor($offers->count() / 2))
            ->each(fn($offer) => $offer->update([
                'product_id' => $products->random()->id,
            ]));

        $orders = Order::factory(20)
            ->recycle($admin)
            ->recycle($outlets)
            ->recycle($customers)
            ->completed()
            ->create();

        $orders->each(function (Order $order) use ($products) {
            $itemCount = fake()->numberBetween(1, 5);
            $selected = $products->random(min($itemCount, $products->count()));

            $total = 0;
            foreach (collect([$selected])->flatten(1) as $product) {
                $qty = fake()->numberBetween(1, 3);
                $unitPrice = $product->price;
                $subtotal = $qty * $unitPrice;
                $total += $subtotal;

                OrderItem::factory()->create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);
            }

            $discount = fake()->boolean(30) ? fake()->randomFloat(2, 10, min(200, $total * 0.2)) : 0;
            $order->update([
                'total_amount' => $total - $discount,
                'discount_amount' => $discount,
            ]);
        });

        $this->command->info('Seeded 20 records each: Users, Outlets, Categories, Products, Customers, Offers, Orders (with items).');
    }
}
