import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { ClientService } from 'src/client/client.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  // imports: [],
  providers: [InvitationService, ClientService, PrismaService],
  controllers: [InvitationController],
})
export class InvitationModule {}
