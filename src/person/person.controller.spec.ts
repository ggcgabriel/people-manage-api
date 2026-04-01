import { Test, TestingModule } from '@nestjs/testing';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';

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

const mockPersonService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  toggleStatus: jest.fn(),
  remove: jest.fn(),
};

describe('PersonController', () => {
  let controller: PersonController;
  let service: typeof mockPersonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonController],
      providers: [{ provide: PersonService, useValue: mockPersonService }],
    }).compile();

    controller = module.get<PersonController>(PersonController);
    service = module.get(PersonService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call personService.create with the dto', async () => {
      const dto = {
        fullName: 'João da Silva',
        email: 'joao@email.com',
        cpf: '123.456.789-01',
        birthDate: '2000-01-15',
        phone: '(11) 98765-4321',
      };
      service.create.mockResolvedValue(mockPerson);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockPerson);
    });
  });

  describe('findAll', () => {
    it('should call personService.findAll with filters', async () => {
      const filters = { page: 1, limit: 10 };
      const paginatedResult = {
        data: [mockPerson],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should call personService.findOne with the id', async () => {
      service.findOne.mockResolvedValue(mockPerson);

      const result = await controller.findOne(mockPerson.id);

      expect(service.findOne).toHaveBeenCalledWith(mockPerson.id);
      expect(result).toEqual(mockPerson);
    });
  });

  describe('update', () => {
    it('should call personService.update with id and dto', async () => {
      const dto = { fullName: 'João Atualizado' };
      const updatedPerson = { ...mockPerson, fullName: 'João Atualizado' };
      service.update.mockResolvedValue(updatedPerson);

      const result = await controller.update(mockPerson.id, dto);

      expect(service.update).toHaveBeenCalledWith(mockPerson.id, dto);
      expect(result).toEqual(updatedPerson);
    });
  });

  describe('toggleStatus', () => {
    it('should call personService.toggleStatus with the id', async () => {
      const toggled = { ...mockPerson, isActive: false };
      service.toggleStatus.mockResolvedValue(toggled);

      const result = await controller.toggleStatus(mockPerson.id);

      expect(service.toggleStatus).toHaveBeenCalledWith(mockPerson.id);
      expect(result).toEqual(toggled);
    });
  });

  describe('remove', () => {
    it('should call personService.remove with the id', async () => {
      const message = { message: 'Pessoa removida com sucesso!' };
      service.remove.mockResolvedValue(message);

      const result = await controller.remove(mockPerson.id);

      expect(service.remove).toHaveBeenCalledWith(mockPerson.id);
      expect(result).toEqual(message);
    });
  });
});
