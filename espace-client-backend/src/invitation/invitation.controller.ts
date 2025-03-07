import { Body, Controller, Post } from '@nestjs/common';
import { InvitationService } from './invitation.service';

@Controller('invitation')
export class InvitationController {
  constructor(private invitationService: InvitationService) {}

  @Post()
  async createInvitation(@Body() data: { clientId: string }) {
    const url = await this.invitationService.generateUrl(data.clientId);
    return { url };
  }
}
