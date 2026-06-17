<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PosFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_pos_login(): void
    {
        $this->get('/dashboard')->assertRedirect(route('pos.login.create'));
    }

    public function test_pos_login_page_renders_pos_component(): void
    {
        $this->get('/pos/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Auth/PosLogin'));
    }

    public function test_successful_login_redirects_to_dashboard(): void
    {
        $user = User::factory()->create([
            'email' => 'flow@test.dev',
            'password' => bcrypt('secret123'),
            'outlet_id' => null,
        ]);

        $this->post('/pos/login', [
            'email' => 'flow@test.dev',
            'password' => 'secret123',
        ])->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user, 'pos');
    }

    public function test_pos_user_without_outlet_reaches_dashboard(): void
    {
        $user = User::factory()->create(['outlet_id' => null]);

        $this->actingAs($user, 'pos')
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Dashboard'));
    }

    public function test_users_index_renders_for_authenticated_user(): void
    {
        $user = User::factory()->create(['outlet_id' => null]);

        $this->actingAs($user, 'pos')
            ->get('/users')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Users/Index'));
    }
}
