import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { env } from 'process';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from './jwt-payload';
import * as cookie from 'cookie';
import { IS_PUBLIC_KEY } from './public.decorators';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();
    const token = request.cookies.token;
    console.log(token);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: env.JWT_SECRET,
      });
      const user = await this.userService.findOneById(payload.sub);
      request['user'] = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
