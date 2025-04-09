import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class QuestionnaireService {
  constructor(private prisma: PrismaService) {}
  async create(data: Prisma.QuestionnaireCreateInput) {
    return this.prisma.questionnaire.create({
      data: {
        client: {
          connect: { id: data.client.connect?.id }, // Associer un client existant
        },
        titre: data.titre,
        question: {
          create: data.question?.create || [], // Créer les questions imbriquées
        },
      },
      include: { question: true }, // Inclure les questions dans la réponse
    });
  }

  async findAll(params: { where?: Prisma.QuestionnaireWhereInput }) {
    const { where } = params;
    const questionnaire = await this.prisma.questionnaire.findMany({ where });
    if (questionnaire.length === 0) {
      throw new NotFoundException('No questionnaire existing for this client');
    }
    return questionnaire;
  }

  async findOne(id: string) {
    return await this.prisma.questionnaire.findUnique({
      where: { id },
    });
  }

  update(id: number, updateQuestionnaireDto: UpdateQuestionnaireDto) {
    return `This action updates a #${id} questionnaire`;
  }

  remove(id: number) {
    return `This action removes a #${id} questionnaire`;
  }
}
