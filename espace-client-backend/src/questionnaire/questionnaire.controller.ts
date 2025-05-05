import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { CurrentUser } from 'src/auth/user.decorators';
import { User } from 'src/auth/entities/user.entity';

@Controller('questionnaire')
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateQuestionnaireDto) {
    return this.questionnaireService.create(dto);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    return user.role === Role.ADMIN
      ? await this.questionnaireService.findAll({})
      : await this.questionnaireService.findAll({
          where: { clientId: user.clientId },
        });
  }

  @Get('user/:clientId')
  async findByUser(
    @Param('clientId') clientId: string,
    @CurrentUser() user: User,
  ) {
    if (user.clientId !== clientId && user.role !== Role.ADMIN) {
      throw new ForbiddenException();
    }
    return this.questionnaireService.findAll({ where: { clientId } });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionnaireService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() createQuestionnaireDto: CreateQuestionnaireDto,
    @CurrentUser() user: User,
  ) {
    const questionnaire = await this.questionnaireService.findOne(id);

    if (questionnaire.clientId !== user.clientId && user.role !== Role.ADMIN) {
      throw new ForbiddenException();
    }
    return this.questionnaireService.update(id, createQuestionnaireDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionnaireService.remove(+id);
  }
}
