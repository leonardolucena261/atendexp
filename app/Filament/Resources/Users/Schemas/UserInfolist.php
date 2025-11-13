<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class UserInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('name')
                    ->label("Nome"),
                TextEntry::make('whatsapp_phone')
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
                TextEntry::make('email')
                    ->label('Endereço de email'),
                IconEntry::make('email_verified_at')
                    ->label('Conta verificada')
                    ->getStateUsing(fn ($record) => !is_null($record->email_verified_at))
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle'),
                TextEntry::make('status')
                    ->badge(),
                TextEntry::make('created_at')
                    ->dateTime('d/m/Y \à\s h:i:s')
                    ->placeholder('-'),
                TextEntry::make('updated_at')
                    ->dateTime('d/m/Y \à\s h:i:s')
                    ->placeholder('-'),
            ]);
    }
}
