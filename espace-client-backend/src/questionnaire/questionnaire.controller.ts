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
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';

@Controller('questionnaire')
export class QuestionnaireController {
  constructor(private readonly questionnaireService: QuestionnaireService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateQuestionnaireDto) {
    console.log('✅ create triggered → body:', dto);
    return this.questionnaireService.create(dto);
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
    console.log('✅ user/:clientId triggered → params:', clientId);
    return this.questionnaireService.findAll({
      where: { clientId: clientId },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionnaireService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() createQuestionnaireDto: CreateQuestionnaireDto,
  ) {
    console.log('✅ update triggered → params:', id);
    console.log('✅ update triggered → body:', createQuestionnaireDto);   
    return this.questionnaireService.update(id, createQuestionnaireDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionnaireService.remove(+id);
  }
}
