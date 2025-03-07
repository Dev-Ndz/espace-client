import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaService } from '../prisma.service';

import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ClientController],
  providers: [
    ClientService,
    PrismaService,
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
  exports: [ClientService],
})
export class ClientModule {}
