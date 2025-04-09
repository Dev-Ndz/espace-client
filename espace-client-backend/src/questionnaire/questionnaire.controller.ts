import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { Prisma } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { RequestWithUser } from 'src/common/types/request-with-user';

@Controller('questionnaire')
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createQuestionnaireDto: Prisma.QuestionnaireCreateInput) {
    return this.questionnaireService.create(createQuestionnaireDto);
  }

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    return req.user.role === Role.ADMIN
      ? await this.questionnaireService.findAll({})
      : await this.questionnaireService.findAll({
          where: { clientId: req.user.clientId },
        });
  }

  @Get('user/:clientId')
  @Roles(Role.ADMIN)
  async findByUser(@Param('clientId') clientId: string) {
    return this.questionnaireService.findAll({
      where: { clientId },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionnaireService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionnaireDto: UpdateQuestionnaireDto,
  ) {
    return this.questionnaireService.update(+id, updateQuestionnaireDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionnaireService.remove(+id);
  }
}
