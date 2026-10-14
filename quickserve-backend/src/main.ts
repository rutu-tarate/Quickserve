import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for React Admin Panel
 // Enable CORS for React Admin Panel and User App
app.enableCors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8081',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(3000);

  console.log('🚀 Server Running : http://localhost:3000');
}

bootstrap();