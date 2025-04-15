import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';

@Injectable()
export class QuestionnaireService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateQuestionnaireDto) {
    return this.prisma.questionnaire.create({
      data: {
        title: dto.title,
        isTemplate: dto.isTemplate ?? false,
        client: dto.clientId ? { connect: { id: dto.clientId } } : undefined,
        sections: {
          create: dto.sections.map((section) => ({
            title: section.title,
            questions: {
              create: section.questions.map((q) => ({
                question: q.question,
                answer: q.answer,
              })),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            questions: true,
          },
        },
      },
    });
  }

  async findAll(params: { where?: Prisma.QuestionnaireWhereInput }) {
    const { where } = params;

    const questionnaire = await this.prisma.questionnaire.findMany({
      where,
      include: {
        sections: {
          include: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
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

  async update(id: string, dto: CreateQuestionnaireDto) {
    const updatedQuestionnaire = await this.prisma.questionnaire.update({
      where: { id },
      data: {
        title: dto.title,
        sections: {
          deleteMany: {}, // La suppression en cascade s'occupera des questions
          create: dto.sections.map((section) => ({
            title: section.title,
            questions: {
              create: section.questions.map((q) => ({
                question: q.question,
                answer: q.answer,
              })),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            questions: true,
          },
        },
      },
    });
    console.log('updatedQuestionnaire', updatedQuestionnaire);
    return updatedQuestionnaire;
  }

  remove(id: number) {
    return `This action removes a #${id} questionnaire`;
  }
}
