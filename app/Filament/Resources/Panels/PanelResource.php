<?php

namespace App\Filament\Resources\Panels;

use App\Filament\Resources\Panels\Pages\CreatePanel;
use App\Filament\Resources\Panels\Pages\EditPanel;
use App\Filament\Resources\Panels\Pages\ListPanels;
use App\Filament\Resources\Panels\Pages\ViewPanel;
use App\Filament\Resources\Panels\Schemas\PanelForm;
use App\Filament\Resources\Panels\Schemas\PanelInfolist;
use App\Filament\Resources\Panels\Tables\PanelsTable;
use App\Models\Panel;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PanelResource extends Resource
{
    protected static ?string $model = Panel::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return PanelForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return PanelInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PanelsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPanels::route('/'),
            'create' => CreatePanel::route('/create'),
            'view' => ViewPanel::route('/{record}'),
            'edit' => EditPanel::route('/{record}/edit'),
        ];
    }
}
