import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import type { CurrentUser } from '@espace-client/shared';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly users: UsersService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  /**
   * The user whose email and password these are, or `null`. An unknown email costs the same
   * time as a wrong password. A hash made with older parameters is replaced on success.
   */
  async verify(email: string, password: string): Promise<CurrentUser | null> {
    const found = await this.users.findCredentials(email);
    const valid = await this.passwordHasher.verify(password, found?.passwordHash);
    if (!found || !valid) {
      return null;
    }
    if (this.passwordHasher.needsRehash(found.passwordHash)) {
      await this.users.updatePasswordHash(found.user.id, await this.passwordHasher.hash(password));
    }
    return found.user;
  }
}
