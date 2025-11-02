<?php

namespace App\Filament\Resources\Panels\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class PanelForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('slug')
                    ->required(),
            ]);
    }
}
