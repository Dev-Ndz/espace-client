import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { env } from 'process';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDTO } from 'src/user/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private async verifyPassword(passwordInput: string, user: User) {
    const isPasswordMatched = await bcrypt.compare(
      passwordInput,
      user.password,
    );
    if (!isPasswordMatched) {
      throw new UnauthorizedException();
    }
  }

  async login(email: string, pass: string): Promise<string> {
    const user = await this.userService.findOneByEmail(email);
    await this.verifyPassword(pass, user);
    const payload = { sub: user.id };
    const token = await this.jwtService.signAsync(payload);
    return token;
  }

  async register(userDTO: CreateUserDTO) {
    if (!userDTO.password) {
      throw new Error('Le mot de passe est requis');
    }
    const encryptedPassword = await bcrypt.hash(userDTO.password, 10);
    const prismaUserCreateInput: Prisma.UserCreateInput = {
      email: userDTO.email,
      password: encryptedPassword,
      role: userDTO.role,
      client: {
        connect: { id: userDTO.clientId },
      },
    };
    const user = await this.userService.create(prismaUserCreateInput);
    console.log('user created');
    return user;
  }
}
