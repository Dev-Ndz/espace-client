export interface Client {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  cover?: string;
  facturationAddress: string;
  facturationFirstName: string;
  facturationLastName: string;
  facturationEmail: string;
  facturationPhone: string;
  isVatLiable: boolean;
  vatNumber?: number;
}
