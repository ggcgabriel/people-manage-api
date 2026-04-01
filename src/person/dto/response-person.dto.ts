import { ApiProperty } from '@nestjs/swagger';

export class PersonResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'João da Silva' })
  fullName!: string;

  @ApiProperty({ example: 'joao@email.com' })
  email!: string;

  @ApiProperty({ example: '12345678901' })
  cpf!: string;

  @ApiProperty({ example: '2000-01-15T00:00:00.000Z' })
  birthDate!: Date;

  @ApiProperty({ example: '(11) 98765-4321' })
  phone!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-04-01T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-04-01T10:00:00.000Z' })
  updatedAt!: Date;
}
