import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from 'process';
import { ClientService } from 'src/client/client.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class InvitationService {
  constructor(
    private clientService: ClientService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  private async verifyClient(clientId: string) {
    const client = await this.clientService.findOne({ id: clientId });
    if (!client) {
      throw new NotFoundException(`Client with id ${clientId} not found`);
    }
  }
  private async createInvitation(clientId: string) {
    return await this.prisma.invitation.create({ data: { clientId } });
  }

  private async generateInvitationToken(clientId: string, inviteId: string) {
    const payload = { clientId: clientId, inviteId: inviteId };
    return await this.jwtService.signAsync(payload);
  }

  async generateUrl(clientId: string) {
    await this.verifyClient(clientId);
    const invitation = await this.createInvitation(clientId);
    const token = await this.generateInvitationToken(clientId, invitation.id);

    // Définition de l'URL Frontend avec un fallback par défaut
    const frontendUrl = process.env.FRONT_END_URL ?? 'http://localhost:4200';
    const url = `${frontendUrl}/auth/register?token=${encodeURIComponent(token)}`;

    return url;
  }
}
