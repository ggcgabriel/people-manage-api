import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PersonService, PaginatedResult } from './person.service.js';
import { CreatePersonDto } from './dto/create-person.dto.js';
import { UpdatePersonDto } from './dto/update-person.dto.js';
import { FilterPersonDto } from './dto/filter-person.dto.js';
import { PersonResponseDto } from './dto/response-person.dto.js';
import { PaginatedPersonResponseDto } from './dto/paginated-response.dto.js';
import { Person } from '../../generated/prisma/client.js';

@ApiTags('Pessoas')
@Controller('people')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova pessoa' })
  @ApiResponse({
    status: 201,
    description: 'Pessoa criada com sucesso',
    type: PersonResponseDto,
  })
  @ApiResponse({ status: 409, description: 'CPF ou e-mail já em uso' })
  create(@Body() dto: CreatePersonDto): Promise<Person> {
    return this.personService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pessoas com filtros e paginação' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de pessoas',
    type: PaginatedPersonResponseDto,
  })
  findAll(@Query() filters: FilterPersonDto): Promise<PaginatedResult<Person>> {
    return this.personService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pessoa por ID' })
  @ApiResponse({
    status: 200,
    description: 'Pessoa encontrada',
    type: PersonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Person> {
    return this.personService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de uma pessoa' })
  @ApiResponse({
    status: 200,
    description: 'Pessoa atualizada',
    type: PersonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada' })
  @ApiResponse({ status: 409, description: 'CPF ou e-mail já em uso' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePersonDto,
  ): Promise<Person> {
    return this.personService.update(id, dto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Alternar status ativo/inativo de uma pessoa' })
  @ApiResponse({
    status: 200,
    description: 'Status alterado',
    type: PersonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada' })
  toggleStatus(@Param('id', ParseUUIDPipe) id: string): Promise<Person> {
    return this.personService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma pessoa permanentemente' })
  @ApiResponse({ status: 200, description: 'Pessoa removida' })
  @ApiResponse({ status: 404, description: 'Pessoa não encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.personService.remove(id);
  }
}
