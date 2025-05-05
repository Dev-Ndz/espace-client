import { User } from "src/auth/entities/user.entity";
import { Questionnaire } from "src/questionnaire/entities/questionnaire.entity";

export class Client {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  cover?: string;
  address?: string;
  TVA?: boolean;
  TVANumber?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt?: Date;
  users: User[];
  questionnaire: Questionnaire[];

}
