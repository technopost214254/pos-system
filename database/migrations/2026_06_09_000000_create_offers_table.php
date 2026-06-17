<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['fixed', 'percentage', 'bogo']); // Buy One Get One, flat discount, percentage
            $table->decimal('value', 8, 2)->nullable(); // For fixed and percentage types
            $table->unsignedInteger('buy_quantity')->default(1); // For BOGO
            $table->unsignedInteger('get_quantity')->default(1); // For BOGO
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('cascade'); // Null means global offer
            $table->boolean('active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
