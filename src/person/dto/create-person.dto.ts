import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsCpf } from '../../common/decorators/is-cpf.decorator.js';

export class CreatePersonDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '123.456.789-09' })
  @IsString()
  @IsNotEmpty()
  @IsCpf()
  cpf!: string;

  @ApiProperty({ example: '2000-01-15' })
  @IsDateString()
  @IsNotEmpty()
  birthDate!: string;

  @ApiProperty({ example: '(11) 98765-4321' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, {
    message: 'Telefone deve ser um número brasileiro válido',
  })
  phone!: string;
}
