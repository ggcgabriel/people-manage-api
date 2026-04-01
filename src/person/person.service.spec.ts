import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PersonService } from './person.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPerson = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  fullName: 'João da Silva',
  email: 'joao@email.com',
  cpf: '12345678901',
  birthDate: new Date('2000-01-15'),
  phone: '(11) 98765-4321',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrismaService = {
  person: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('PersonService', () => {
  let service: PersonService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PersonService>(PersonService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      fullName: 'João da Silva',
      email: 'joao@email.com',
      cpf: '123.456.789-01',
      birthDate: '2000-01-15',
      phone: '(11) 98765-4321',
    };

    it('should create a person successfully', async () => {
      prisma.person.findFirst.mockResolvedValue(null);
      prisma.person.create.mockResolvedValue(mockPerson);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPerson);
      expect(prisma.person.create).toHaveBeenCalledWith({
        data: {
          fullName: createDto.fullName,
          email: createDto.email,
          cpf: '12345678901',
          birthDate: new Date(createDto.birthDate),
          phone: createDto.phone,
        },
      });
    });

    it('should throw ConflictException if CPF already exists', async () => {
      prisma.person.findFirst.mockResolvedValueOnce(mockPerson);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.person.findFirst
        .mockResolvedValueOnce(null) // CPF check
        .mockResolvedValueOnce(mockPerson); // email check

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.person.findMany.mockResolvedValue([mockPerson]);
      prisma.person.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: [mockPerson],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });
      expect(prisma.person.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('should not filter by isActive when not provided', async () => {
      prisma.person.findMany.mockResolvedValue([]);
      prisma.person.count.mockResolvedValue(0);

      await service.findAll({});

      expect(prisma.person.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it('should apply name filter with case-insensitive search', async () => {
      prisma.person.findMany.mockResolvedValue([]);
      prisma.person.count.mockResolvedValue(0);

      await service.findAll({ name: 'João' });

      expect(prisma.person.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fullName: { contains: 'João', mode: 'insensitive' },
          }) as unknown,
        }),
      );
    });

    it('should calculate correct pagination offset', async () => {
      prisma.person.findMany.mockResolvedValue([]);
      prisma.person.count.mockResolvedValue(25);

      const result = await service.findAll({ page: 3, limit: 5 });

      expect(prisma.person.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
      expect(result.meta.totalPages).toBe(5);
    });
  });

  describe('findOne', () => {
    it('should return a person by id', async () => {
      prisma.person.findUnique.mockResolvedValue(mockPerson);

      const result = await service.findOne(mockPerson.id);

      expect(result).toEqual(mockPerson);
    });

    it('should throw NotFoundException if person does not exist', async () => {
      prisma.person.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = { fullName: 'João Atualizado' };

    it('should update a person successfully', async () => {
      const updatedPerson = { ...mockPerson, fullName: 'João Atualizado' };
      prisma.person.findUnique.mockResolvedValue(mockPerson);
      prisma.person.findFirst.mockResolvedValue(null);
      prisma.person.update.mockResolvedValue(updatedPerson);

      const result = await service.update(mockPerson.id, updateDto);

      expect(result.fullName).toBe('João Atualizado');
    });

    it('should throw NotFoundException if person does not exist', async () => {
      prisma.person.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if email is already in use', async () => {
      prisma.person.findUnique.mockResolvedValue(mockPerson);
      prisma.person.findFirst.mockResolvedValue({
        ...mockPerson,
        id: 'other-id',
      });

      await expect(
        service.update(mockPerson.id, { email: 'existing@email.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('toggleStatus', () => {
    it('should toggle isActive from true to false', async () => {
      prisma.person.findUnique.mockResolvedValue(mockPerson);
      prisma.person.update.mockResolvedValue({
        ...mockPerson,
        isActive: false,
      });

      const result = await service.toggleStatus(mockPerson.id);

      expect(result.isActive).toBe(false);
      expect(prisma.person.update).toHaveBeenCalledWith({
        where: { id: mockPerson.id },
        data: { isActive: false },
      });
    });

    it('should toggle isActive from false to true', async () => {
      const inactivePerson = { ...mockPerson, isActive: false };
      prisma.person.findUnique.mockResolvedValue(inactivePerson);
      prisma.person.update.mockResolvedValue({
        ...inactivePerson,
        isActive: true,
      });

      const result = await service.toggleStatus(mockPerson.id);

      expect(result.isActive).toBe(true);
      expect(prisma.person.update).toHaveBeenCalledWith({
        where: { id: mockPerson.id },
        data: { isActive: true },
      });
    });

    it('should throw NotFoundException if person does not exist', async () => {
      prisma.person.findUnique.mockResolvedValue(null);

      await expect(service.toggleStatus('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should hard delete a person', async () => {
      prisma.person.findUnique.mockResolvedValue(mockPerson);
      prisma.person.delete.mockResolvedValue(mockPerson);

      const result = await service.remove(mockPerson.id);

      expect(result.message).toContain('removida');
      expect(prisma.person.delete).toHaveBeenCalledWith({
        where: { id: mockPerson.id },
      });
    });

    it('should throw NotFoundException if person does not exist', async () => {
      prisma.person.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
