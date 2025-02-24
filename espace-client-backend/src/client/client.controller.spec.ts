import { Test, TestingModule } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { Prisma, Client } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('ClientController', () => {
  let controller: ClientController;
  let service: ClientService;

  const mockClient: Client = {
    id: 'uuid-123',
    name: 'Test Corp',
    description: 'Test description',
    logo: 'https://example.com/logo.png',
    cover: 'https://example.com/cover.jpg',
    address: '123 Main Street',
    TVA: true,
    TVANumber: 'BE0123456789',
    email: 'test@example.com',
    phone: '123456789',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockClientService = {
    create: jest.fn().mockResolvedValue(mockClient),
    findAll: jest.fn().mockResolvedValue([mockClient]),
    findOne: jest.fn().mockResolvedValue(mockClient),
    update: jest.fn().mockResolvedValue(mockClient),
    delete: jest.fn().mockResolvedValue(mockClient),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        {
          provide: ClientService,
          useValue: mockClientService,
        },
      ],
    }).compile();

    controller = module.get<ClientController>(ClientController);
    service = module.get<ClientService>(ClientService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createClient', () => {
    it('should create a client', async () => {
      const clientData: Prisma.ClientCreateInput = {
        name: 'Test Corp',
        description: 'Test description',
        email: 'test@example.com',
        phone: '123456789',
      };

      const result = await controller.createClient(clientData);
      expect(result).toEqual(mockClient);
      expect(service.create).toHaveBeenCalledWith(clientData);
    });
  });

  describe('getAllClients', () => {
    it('should return an array of clients', async () => {
      const result = await controller.getAllClients();
      expect(result).toEqual([mockClient]);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('getClientById', () => {
    it('should return a client by ID', async () => {
      const result = await controller.getClientById('uuid-123');
      expect(result).toEqual(mockClient);
      expect(service.findOne).toHaveBeenCalledWith({ id: 'uuid-123' });
    });

    it('should throw NotFoundException if client does not exist', async () => {
      service.findOne = jest.fn().mockResolvedValue(null);

      await expect(controller.getClientById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateClient', () => {
    it('should update a client', async () => {
      const updateData: Prisma.ClientUpdateInput = { name: 'Updated Corp' };

      const result = await controller.updateClient('uuid-123', updateData);
      expect(result).toEqual(mockClient);
      expect(service.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: updateData,
      });
    });
  });

  describe('deleteClient', () => {
    it('should delete a client', async () => {
      const result = await controller.deleteClient('uuid-123');
      expect(result).toEqual(mockClient);
      expect(service.delete).toHaveBeenCalledWith({ id: 'uuid-123' });
    });
  });
});
