import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, SessionCookieProvider } from '@nestjs/authentication';
import type { SessionRecord } from '@nestjs/authentication';
import type { CurrentUser } from '@espace-client/shared';
import { UsersService } from '../users/users.service.js';

/** Authenticates requests by their session cookie; a deleted user ends the session. */
@Injectable()
export class SessionAuth extends SessionCookieProvider<CurrentUser> {
  constructor(
    private readonly users: UsersService,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerProvider(this);
  }

  protected validate(session: SessionRecord): Promise<CurrentUser | null> {
    return this.users.findById(session.userId);
  }
}
