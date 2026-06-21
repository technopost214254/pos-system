<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin', 'password' => 'admin123'],
        );

        foreach (['Men', 'Women', 'Kids', 'Accessories'] as $name) {
            Category::firstOrCreate(
                ['user_id' => $admin->id, 'name' => $name],
                ['slug' => strtolower($name), 'description' => "{$name}'s products"],
            );
        }
    }
}
