<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Enums\UserStatus;
use Filament\Models\Contracts\HasAvatar;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable implements HasAvatar
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'avatar',
        'whatsapp_phone'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => UserStatus::class,
        ];
    }

    /**
     * Get the panels for the user.
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany<Panel, User, \Illuminate\Database\Eloquent\Relations\Pivot>
     */
    public function panels():BelongsToMany
    {
        return $this->belongsToMany(Panel::class);
    }

    public function getFilamentAvatarUrl(): string|null
    {
        //retorna a campo do banco de dados que contém o avatar (imagem)
        if (! $this->avatar) {
            return null;
        }
        // Se estiver no disco 'public'
        // return Storage::disk('public')->url($this->avatar);

        // Se estiver no disco 'private', gere uma URL temporária:
        return Storage::disk('private')->emporaryUrl($this->avatar);
    }

}
