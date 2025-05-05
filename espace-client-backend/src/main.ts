import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const allowedOrigins = [
    'http://localhost:4200',
    'https://espace-client-ldz.netlify.app',
  ];

  // app.use(
  //   session({
  //     secret: process.env.SESSION_SECRET || 'Super Secret (change it)',
  //     resave: true,
  //     saveUninitialized: false,
  //     cookie: {
  //       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // must be 'none' to enable cross-site delivery
  //       secure: process.env.NODE_ENV === 'production', // must be true if sameSite='none'
  //     },
  //   }),
  // );
  if (process.env.NODE_ENV !== 'production') {
    app.setGlobalPrefix('api');
  }

  app.enableCors({
    origin: allowedOrigins, // Remplacez "*" par l'origine spécifique pour plus de sécurité en production
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization, Cookie', // Ajouter d'autres headers si nécessaire
  });
  app.set('trust proxy', 1);
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
  console.log('listening to port: ', process.env.PORT ?? 3000);
}
bootstrap();
