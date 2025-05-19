import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOneById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return user;
  }
  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException(`Client with email ${email} not found`);
    }
    return user;
  }

  /**
   * Retrieves a list of users with pagination, filtering, and sorting options.
   *
   * @param {Object} params - Query parameters.
   * @param {number} [params.skip] - Number of records to skip (useful for pagination).
   * @param {number} [params.take] - Maximum number of records to retrieve.
   * @param {Prisma.UserWhereUniqueInput} [params.cursor] - Cursor for pagination, specifying a starting point.
   * @param {Prisma.UserWhereInput} [params.where] - Filters to apply to the query.
   * @param {Prisma.UserOrderByWithRelationInput} [params.orderBy] - Defines the sorting order of the results.
   *
   * @returns {Promise<User[]>} - A list of users matching the given criteria.
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    console.log(params);
    const userList = await this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
    console.log(userList);
    return userList;
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<User> {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }
}
