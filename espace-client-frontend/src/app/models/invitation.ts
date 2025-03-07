import { Client } from './client';

export interface Invitation {
  id: string;
  isAccountCreated: boolean;
  createdAt: Date;
  validUntil?: Date;
  client?: Client;
}
