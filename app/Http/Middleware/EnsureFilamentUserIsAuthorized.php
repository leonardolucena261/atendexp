<?php

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use Filament\Facades\Filament;
use Filament\Http\Middleware\Authenticate as BaseAuthenticate;
use Illuminate\Database\Eloquent\Model;

class EnsureFilamentUserIsAuthorized extends BaseAuthenticate
{
    /**
     * @param  array<string>  $guards
     */
    protected function authenticate($request, array $guards): void
    {
        parent::authenticate($request, $guards);

        /** @var Model $user */
        $user = Filament::auth()->user();

        if (! $user) {
            abort(403);
        }

        if ($user->status !== UserStatus::HABILITADO) {
            abort(403, 'Usuário inabilitado.');
        }

        $panel = Filament::getCurrentOrDefaultPanel();
        $panelSlug = $panel?->getId();

        $hasAccessToPanel = $panelSlug
            ? $user->panels()->where('slug', $panelSlug)->exists()
            : false;

        abort_unless($hasAccessToPanel, 403, 'Usuário sem acesso a este painel.');
    }
}

