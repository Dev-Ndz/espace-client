import { Client } from "src/client/entities/client.entity";
import { Role } from "../role.enum";

export class User {
  id: string;
  email: string;
  password: string;
  role: Role;
  clientId: string;
  client: Client;

}
