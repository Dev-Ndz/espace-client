import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaService } from '../prisma.service';

import { UserModule } from '../user/user.module';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';

@Module({
  imports: [UserModule],
  controllers: [ClientController],
  providers: [
    ClientService,
    PrismaService,
    CaslAbilityFactory,
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
  exports: [ClientService],
})
export class ClientModule {}
