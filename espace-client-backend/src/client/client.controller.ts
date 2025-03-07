import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { Prisma } from '@prisma/client';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  createClient(@Body() data: Prisma.ClientCreateInput) {
    return this.clientService.create(data);
  }

  @Get()
  getAllClients() {
    return this.clientService.findAll({});
  }

  @Get(':id')
  async getClientById(@Param('id') id: string) {
    const client = await this.clientService.findOne({ id });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  @Patch(':id')
  updateClient(
    @Param('id') id: string,
    @Body() data: Prisma.ClientUpdateInput,
  ) {
    return this.clientService.update({ where: { id }, data });
  }

  @Delete(':id')
  deleteClient(@Param('id') id: string) {
    return this.clientService.delete({ id });
  }
}
