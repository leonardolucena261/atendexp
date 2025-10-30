<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Panel extends Model
{
    protected $fillable = [
        'name',
        'slug',
    ];

    /**
     * Get the users for the panel.
     * @return BelongsToMany<User, Panel, \Illuminate\Database\Eloquent\Relations\Pivot>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
