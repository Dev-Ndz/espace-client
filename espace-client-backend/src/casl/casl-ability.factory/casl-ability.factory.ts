import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { Prisma } from '@prisma/client';
import { User } from 'src/auth/entities/user.entity';
import { Questionnaire } from 'src/questionnaire/entities/questionnaire.entity';
import { Action } from '../action.enum';
import { Injectable } from '@nestjs/common';
import { Role } from 'src/auth/role.enum';
import { Client } from 'src/client/entities/client.entity';

type Subjects =
  | InferSubjects<typeof Questionnaire | typeof Client | typeof User>
  | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, build } = new AbilityBuilder<MongoAbility<[Action, Subjects]>>(
      createMongoAbility,
    );

    if (user.role === Role.ADMIN) {
      can(Action.Manage, 'all');
    } else {
      can(Action.Read, Questionnaire, { clientId: user.clientId });
      can(Action.Read, Client, { id: user.clientId });
      can(Action.Update, Questionnaire, { clientId: user.clientId });
    }

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
