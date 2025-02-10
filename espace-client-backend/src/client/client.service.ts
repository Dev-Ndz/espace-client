import { Injectable } from '@nestjs/common';
import { Client, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new client in the database.
   *
   * @param {Prisma.ClientCreateInput} data - Data required to create a new client.
   * @returns {Promise<Client>} - The created client.
   */
  async create(data: Prisma.ClientCreateInput): Promise<Client> {
    return this.prisma.client.create({ data });
  }

  /**
   * Retrieves a list of clients with pagination, filtering, and sorting options.
   *
   * @param {Object} params - Query parameters.
   * @param {number} [params.skip] - Number of records to skip (useful for pagination).
   * @param {number} [params.take] - Maximum number of records to retrieve.
   * @param {Prisma.ClientWhereUniqueInput} [params.cursor] - Cursor for pagination, specifying a starting point.
   * @param {Prisma.ClientWhereInput} [params.where] - Filters to apply to the query.
   * @param {Prisma.ClientOrderByWithRelationInput} [params.orderBy] - Defines the sorting order of the results.
   *
   * @returns {Promise<Client[]>} - A list of clients matching the given criteria.
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ClientWhereUniqueInput;
    where?: Prisma.ClientWhereInput;
    orderBy?: Prisma.ClientOrderByWithRelationInput;
  }): Promise<Client[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.client.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  /**
   *
   * @param clientWhereUniqueInput - Unique identifier to find the client.
   * @returns - the client matching the unique identifier
   */
  async findOne(
    clientWhereUniqueInput: Prisma.ClientWhereUniqueInput,
  ): Promise<Client | null> {
    return this.prisma.client.findUnique({ where: clientWhereUniqueInput });
  }

  /**
   * Updates an existing client based on unique criteria.
   *
   * @param {Object} params - Parameters for updating a client.
   * @param {Prisma.ClientWhereUniqueInput} params.where - Unique identifier to find the client.
   * @param {Prisma.ClientUpdateInput} params.data - Data to update.
   * @returns {Promise<Client>} - The updated client.
   */
  async update(params: {
    where: Prisma.ClientWhereUniqueInput;
    data: Prisma.ClientUpdateInput;
  }): Promise<Client> {
    const { where, data } = params;
    return this.prisma.client.update({
      data,
      where,
    });
  }

  /**
   * Deletes a client based on a unique identifier.
   *
   * @param {Prisma.ClientWhereUniqueInput} where - Unique identifier to find and delete the client.
   * @returns {Promise<Client>} - The deleted client.
   */
  async delete(where: Prisma.ClientWhereUniqueInput): Promise<Client> {
    return this.prisma.client.delete({
      where,
    });
  }
}
