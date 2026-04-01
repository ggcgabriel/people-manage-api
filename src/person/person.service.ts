import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePersonDto } from './dto/create-person.dto.js';
import { UpdatePersonDto } from './dto/update-person.dto.js';
import { FilterPersonDto } from './dto/filter-person.dto.js';
import { sanitizeCpf } from '../common/utils/cpf.util.js';
import { Person, Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePersonDto): Promise<{ message: string }> {
    const cpf = sanitizeCpf(dto.cpf);
    await this.checkUniqueness(cpf, dto.email);

    await this.prisma.person.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        cpf,
        birthDate: new Date(dto.birthDate),
        phone: dto.phone,
      },
    });

    return {
      message: 'Pessoa criada com sucesso!',
    };
  }

  async findAll(filters: FilterPersonDto): Promise<Person[]> {
    const where: Prisma.PersonWhereInput = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.name) {
      where.fullName = { contains: filters.name, mode: 'insensitive' };
    }

    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }

    if (filters.cpf) {
      where.cpf = { contains: sanitizeCpf(filters.cpf) };
    }

    return this.prisma.person.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Person> {
    const person = await this.prisma.person.findUnique({ where: { id } });

    if (!person) {
      throw new NotFoundException(`Pessoa com id "${id}" não encontrada`);
    }

    return person;
  }

  async update(id: string, dto: UpdatePersonDto): Promise<{ message: string }> {
    await this.findOne(id);

    const cpf = dto.cpf ? sanitizeCpf(dto.cpf) : undefined;
    await this.checkUniqueness(cpf, dto.email, id);

    const person = await this.prisma.person.update({
      where: { id },
      data: {
        ...dto,
        cpf,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });

    return {
      message: `${person.fullName} foi atualizado(a) com sucesso!`,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.prisma.person.delete({ where: { id } });
    return {
      message: 'Pessoa deletada com sucesso!',
    };
  }

  private async checkUniqueness(
    cpf?: string,
    email?: string,
    excludeId?: string,
  ): Promise<void> {
    if (cpf) {
      const existingByCpf = await this.prisma.person.findFirst({
        where: {
          cpf,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
      });

      if (existingByCpf) {
        throw new ConflictException('CPF já em uso');
      }
    }

    if (email) {
      const existingByEmail = await this.prisma.person.findFirst({
        where: {
          email,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
      });

      if (existingByEmail) {
        throw new ConflictException('E-mail já em uso');
      }
    }
  }
}
