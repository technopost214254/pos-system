<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ProcessOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public array $cart,
        public array $customer,
        public string $paymentMethod,
        public float $totalAmount,
        public int $userId,
        public ?int $outletId = null,
        public ?int $offerId = null,
        public float $discountAmount = 0
    ) {}

    public function handle(): void
    {
        DB::transaction(function () {
            $order = Order::create([
                'user_id'        => $this->userId,
                'outlet_id'      => $this->outletId,
                'customer_id'    => $this->customer['id'] ?? null,
                'customer_name'  => $this->customer['name'] ?? null,
                'customer_phone' => $this->customer['phone'] ?? null,
                'payment_method' => $this->paymentMethod,
                'payment_status' => 'unpaid',
                'status'         => 'pending',
                'total_amount'   => $this->totalAmount,
                'offer_id'       => $this->offerId,
                'discount_amount' => $this->discountAmount,
            ]);

            foreach ($this->cart as $item) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $item['id'],
                    'quantity'   => $item['qty'],
                    'unit_price' => $item['price'],
                    'subtotal'   => $item['subtotal'],
                ]);

                Product::where('id', $item['id'])
                    ->decrement('stock', $item['qty']);
            }
        });
    }
}
