import { Body, Controller, Get, Post, Res, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Public } from './public.decorators';
import { JwtService } from '@nestjs/jwt';
import { Roles } from './roles.decorator';
import { Role } from './role.enum';
import { CurrentUser } from './user.decorators';
import { User } from '@prisma/client';
import { ClientService } from '../client/client.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private clientService: ClientService,
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body() userData: { email: string; password: string },
    @Res() res: Response,
  ) {
    const token = await this.authService.login(
      userData.email,
      userData.password,
    );

    res.cookie('token', token, {
      httpOnly: true, // Empêche l'accès au cookie via JS
      secure: true, // ⚠️ Désactivé en localhost (HTTPS pas nécessaire)
      sameSite: 'none', // Meilleure compatibilité pour localhost
      maxAge: 7 * 24 * 60 * 60 * 1000, // Expiration : 7 jours
    });

    return res.send({ message: 'Connexion réussie' });
  }

  @Public()
  @Post('register')
  async register(
    @Body()
    userData: {
      email: string;
      password: string;
      clientId: string;
      role?: Role;
    },
    @Headers('authorization') authHeader: string, // Récupère l'en-tête Authorization
  ) {
    console.log('Authorization Header:', authHeader);
    if (authHeader) {
      const token = authHeader?.split(' ')[1]; // Supprime "Bearer " pour ne garder que le token
      const jwtPayload = this.jwtService.decode(token);
      userData.clientId = jwtPayload.clientId;
    }
    const newUser = await this.authService.register(userData);
    return { message: 'Inscription réussie', user: newUser };
  }
  @Public()
  @Get('logout')
  async logout(@Res() res: Response) {
    console.log('logout request...');
    res.clearCookie('token');
    return res.send({ message: 'Logged out' });
  }

  @Get('isAuthenticated')
  async isAuthenticated() {
    return { isAuthenticated: true };
  }

  @Get('isAdmin')
  @Roles(Role.ADMIN)
  async isAdmin() {
    return { isAdmin: true };
  }

  @Get('me')
  async me(@CurrentUser() user: User) {
    const id = user.clientId;
    console.log(id);
    const client = await this.clientService.findOne({ id: id });
    return client;
  }
}
