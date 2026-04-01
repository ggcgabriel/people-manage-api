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

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePersonDto): Promise<Person> {
    const cpf = sanitizeCpf(dto.cpf);
    await this.checkUniqueness(cpf, dto.email);

    return this.prisma.person.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        cpf,
        birthDate: new Date(dto.birthDate),
        phone: dto.phone,
      },
    });
  }

  async findAll(filters: FilterPersonDto): Promise<PaginatedResult<Person>> {
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

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.person.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Person> {
    const person = await this.prisma.person.findUnique({ where: { id } });

    if (!person) {
      throw new NotFoundException(`Pessoa com id "${id}" não encontrada`);
    }

    return person;
  }

  async update(id: string, dto: UpdatePersonDto): Promise<Person> {
    await this.findOne(id);

    const cpf = dto.cpf ? sanitizeCpf(dto.cpf) : undefined;
    await this.checkUniqueness(cpf, dto.email, id);

    return this.prisma.person.update({
      where: { id },
      data: {
        ...dto,
        cpf,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });
  }

  async toggleStatus(id: string): Promise<Person> {
    const person = await this.findOne(id);

    return this.prisma.person.update({
      where: { id },
      data: { isActive: !person.isActive },
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.prisma.person.delete({ where: { id } });

    return {
      message: 'Pessoa removida com sucesso!',
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
