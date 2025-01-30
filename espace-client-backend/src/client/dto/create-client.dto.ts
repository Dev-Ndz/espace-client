export class CreateClientDto {
  id: string;
  description: string;
  logo?: string;
  cover?: string;
  address: string;
  TVA: boolean;
  TVANumber: number;
  name: string;
  email: string;
  phone: string;
}
