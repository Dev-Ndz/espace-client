import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { UserService } from './user.service';
import { CurrentUser } from 'src/auth/user.decorators';
import { User } from 'src/auth/entities/user.entity';
import { Prisma } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('client/:id')
  @Roles(Role.ADMIN)
  async getUsersByClient(@Param('id') clientId: string) {
    console.log('finding user for client', clientId);
    return this.userService.findAll({ where: { clientId } });
  }

  @Get(':id')
  async getUserById(@Param('id') id: string, @CurrentUser() currentUser: User) {
    if (currentUser.id !== id && currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException();
    }
    const user = await this.userService.findOneById(id);

    return user;
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
    @Body() data: Prisma.UserUpdateInput,
  ) {
    if (currentUser.id !== id && currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException();
    }
    return await this.userService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteUser(@Param('id') id: string) {
    return await this.userService.delete(id);
  }
}
