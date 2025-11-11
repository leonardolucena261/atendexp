<?php

namespace App\Filament\Resources\Users\Tables;

use App\Enums\UserStatus;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
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
                TextColumn::make('whatsapp_phone')
                    ->label('WhatsApp')
                    ->formatStateUsing(function ($state) {
                        if (!$state) {
                            return null;
                        }

                        // Remove todos os caracteres não numéricos
                        $phone = preg_replace('/\D/', '', $state);

                        // Verifica se tem pelo menos 13 dígitos (DDI + DDD + número)
                        if (strlen($phone) < 13) {
                            return $state; // Retorna original se não tiver formato válido
                        }

                        // Extrai DDI (2 dígitos), DDD (2 dígitos) e número (9 dígitos)
                        $ddi = substr($phone, 0, 2);
                        $ddd = substr($phone, 2, 2);
                        $numero = substr($phone, 4);

                        // Formata número como XXXXX-XXXX
                        $numeroFormatado = substr($numero, 0, 5) . '-' . substr($numero, 5);

                        return "+{$ddi} {$ddd} {$numeroFormatado}";
                    })
                    ->url(function ($record) {
                        return "https://web.whatsapp.com/send/?phone={$record->whatsapp_phone}";
                    })
                    ->openUrlInNewTab(),
                TextColumn::make('email')
                    ->label('Endereço de E-mail')
                    ->searchable(),
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
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
