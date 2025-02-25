import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaService } from 'src/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/guard';
import { UserModule } from 'src/user/user.module';

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
