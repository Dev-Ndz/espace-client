import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: 'http://localhost:4200', // Remplacez "*" par l'origine spécifique pour plus de sécurité en production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization', // Ajouter d'autres headers si nécessaire
  });
  await app.listen(process.env.PORT ?? 3000);
  console.log('listening to port: ', process.env.PORT ?? 3000);
}
bootstrap();
