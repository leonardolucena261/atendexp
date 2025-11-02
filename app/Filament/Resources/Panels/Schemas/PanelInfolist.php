<?php

namespace App\Filament\Resources\Panels\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class PanelInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('name'),
                TextEntry::make('slug'),
                TextEntry::make('created_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('updated_at')
                    ->dateTime()
                    ->placeholder('-'),
            ]);
    }
}
