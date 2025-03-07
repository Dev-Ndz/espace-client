import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const allowedOrigins = [
    'http://localhost:4200',
    'https://espace-client-ldz.netlify.app',
  ];

  // app.setGlobalPrefix('api');
  app.enableCors({
    origin: allowedOrigins, // Remplacez "*" par l'origine spécifique pour plus de sécurité en production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization', // Ajouter d'autres headers si nécessaire
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
  console.log('listening to port: ', process.env.PORT ?? 3000);
  console.log('allowed origin : ', allowedOrigins);
}
bootstrap();
