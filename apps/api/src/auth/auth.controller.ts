import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, Public, SignInService } from '@nestjs/authentication';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { CurrentUser as User } from '@espace-client/shared';
import { CredentialsService } from './credentials.service.js';
import { parseSignInBody } from './sign-in-body.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly credentials: CredentialsService,
    private readonly signInService: SignInService,
  ) {}

  /** Same 401 for a wrong password and an unknown email: the answer reveals no account. */
  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('sign-in')
  @HttpCode(200)
  async signIn(@Body() body: unknown): Promise<User> {
    const { email, password } = parseSignInBody(body);
    const user = await this.credentials.verify(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    await this.signInService.signIn(user.id, { method: 'password' });
    return user;
  }

  @Post('sign-out')
  @HttpCode(204)
  async signOut(): Promise<void> {
    await this.signInService.signOut();
  }

  @Get('me')
  me(@CurrentUser() user: User): User {
    return user;
  }
}
