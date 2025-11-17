<?php

namespace App\Filament\Resources\Users\Schemas;

use App\Enums\UserStatus;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->label('Nome')
                    ->placeholder('Nome completo do usuário')
                    ->rules(['min:3', 'max:255'])
                    ->required()
                    ->validationMessages([
                        'required'  => 'O nome é obrigatório.',
                        'min'       => 'O nome deve ter pelo menos 3 caracteres.',
                        'max'       => 'O nome deve ter no máximo 255 caracteres.'
                    ]),
                TextInput::make('whatsapp_phone')
                    ->label('Telefone')
                    ->placeholder('Telefone de Whatsapp (DDD) 9xxxx-yyyy')
                    ->unique()
                    ->mask('(99) 99999-9999')
                    ->validationMessages([
                        'required'  => 'O telefone é obrigatório',
                        'unique'    => 'Este telefone já está sendo utilizado.'
                    ]),
                TextInput::make('email')
                    ->label('Endereço de email')
                    ->placeholder('Informe seu melhor email.')
                    ->email()
                    ->unique()
                    ->required()
                    ->validationMessages([
                        'required'  => 'O nome é obrigatório.',
                        'email'     => 'Informe um e-mail válido.',
                        'unique'    => 'Este e-mail já está sendo utilizado.'
                    ]),
                FileUpload::make('avatar')
                    ->avatar()
                    ->imageEditor()
                    ->directory('avatars'),
                //DateTimePicker::make('email_verified_at'),
                TextInput::make('password')
                    ->password()
                    ->required(),
                Select::make('status')
                    ->options(UserStatus::class)
                    ->default('habilitado')
                    ->required(),
            ]);
    }
}
