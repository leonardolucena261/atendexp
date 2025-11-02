<?php

namespace Database\Seeders;

use App\Models\Panel;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CreateAdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Garantir que o painel 'admin' exista
        $adminPanel = Panel::firstOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Admin']
        );

        // Criar ou atualizar o usuário administrador
        $user = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('admin'),
                'status' => 'habilitado',
                'email_verified_at' => now(),
            ]
        );

        // Garantir que o usuário tenha acesso ao painel 'admin'
        if (! $user->panels->contains($adminPanel->id)) {
            $user->panels()->attach($adminPanel);
        }
    }
}
