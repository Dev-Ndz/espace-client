import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './client/client.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { InvitationModule } from './invitation/invitation.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guard';
import { RolesGuard } from './auth/role.guard';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { CaslModule } from './casl/casl.module';

@Module({
  imports: [ClientModule, AuthModule, UserModule, InvitationModule, QuestionnaireModule, CaslModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
