import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma, Role } from '@prisma/client';
import { CreateUserDTO } from 'src/user/create-user.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() userData: { email: string; password: string },
    @Res() res: Response,
  ) {
    const token = await this.authService.login(
      userData.email,
      userData.password,
    );

    res.cookie('access_token', token, {
      httpOnly: true, // Empêche l'accès au cookie via JS
      secure: false, // ⚠️ Désactivé en localhost (HTTPS pas nécessaire)
      sameSite: 'lax', // Meilleure compatibilité pour localhost
      maxAge: 7 * 24 * 60 * 60 * 1000, // Expiration : 7 jours
    });

    return res.send({ message: 'Connexion réussie' });
  }

  @Post('register')
  async register(
    @Body()
    userData: {
      email: string;
      password: string;
      clientId: string;
      role?: Role;
    },
  ) {
    const newUser = await this.authService.register(userData);
    console.log('newUser : ', newUser);
    return { message: 'Inscription réussie' };
  }
}
