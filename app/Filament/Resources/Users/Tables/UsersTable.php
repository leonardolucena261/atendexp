<?php

namespace App\Filament\Resources\Users\Tables;

use App\Enums\UserStatus;
use Filament\Actions\ActionGroup;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->label('Nome')
                    ->sortable(),
                ImageColumn::make('avatar')
                    ->label('Avatar')
                    ->circular(),
                IconColumn::make('whatsapp_phone')
                    ->label('WhatsApp')
                    ->getStateUsing(fn ($record) => !empty($record->whatsapp_phone))
                    ->boolean()
                    ->trueIcon('heroicon-o-phone-arrow-up-right')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('gray')
                    ->url(function ($record) {
                        if (empty($record->whatsapp_phone)) {
                            return null;
                        }
                        // Remove caracteres não numéricos para o link
                        $phone = preg_replace('/\D/', '', $record->whatsapp_phone);
                        return "https://web.whatsapp.com/send/?phone={$phone}";
                    })
                    ->openUrlInNewTab(),
                TextColumn::make('email')
                    ->label('Endereço de E-mail')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                IconColumn::make('email_verified_at')
                    ->label('Conta verificada')
                    ->getStateUsing(fn ($record) => !is_null($record->email_verified_at))
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle'),
                TextColumn::make('status')
                    ->badge()
                    ->label('Status')
                    ->color(fn ($record) => match ($record->status) {
                        UserStatus::HABILITADO => 'success',
                        UserStatus::INABILITADO => 'danger',
                    }),
                TextColumn::make('panels_count')
                    ->label('Painéis')
                    ->counts('panels'),
                TextColumn::make('created_at')
                    ->label('Criado em:')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->label('Atualizado em:')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                ActionGroup::make([
                    ViewAction::make()
                        ->label('Detalhes')
                        ->iconSize('lg'),
                    EditAction::make()
                        ->label('Editar')
                        ->iconSize('lg')
                ]),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
