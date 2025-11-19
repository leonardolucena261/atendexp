<?php

namespace App\Providers\Filament;

use App\Http\Middleware\EnsureFilamentUserIsAuthorized;
use Filament\Enums\ThemeMode;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets\AccountWidget;
use Filament\Widgets\FilamentInfoWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->sidebarCollapsibleOnDesktop() // ou ->sidebarFullyCollapsibleOnDesktop() para desenvolvimento de produção
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->brandName('AtendeXP') // Nome do sistema
            ->brandLogo(asset('images/logoWhitMode.png')) // Logo do sistema
            ->brandLogoHeight('3rem') // Altura da logo
            ->darkModeBrandLogo(asset('images/logoDarkMode.png')) // Logo do sistema no modo escuro
            ->favicon(asset('images/favicon-32x32.ico')) // Favicon do sistema
            //->defaultThemeMode(ThemeMode::Dark)
            ->colors([
                'primary' => Color::hex('#7A3FBF'), //cor padrão do filament Color::Amber,

            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->widgets([
                AccountWidget::class,
                FilamentInfoWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                //Authenticate::class,
                EnsureFilamentUserIsAuthorized::class,
            ]);
    }
}
