import { Role } from '@prisma/client';

export class CreateUserDTO {
  email: string;
  password: string;
  clientId: string;
  role?: Role;
}
