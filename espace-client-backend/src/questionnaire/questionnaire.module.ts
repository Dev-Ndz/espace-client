import { Module } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireController } from './questionnaire.controller';
import { PrismaService } from 'src/prisma.service';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';

@Module({
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService, PrismaService, CaslAbilityFactory],
})
export class QuestionnaireModule {}
