// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ تفعيل CORS للسماح بالوصول من المتصفح
  app.enableCors();

 
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));


  app.setGlobalPrefix('api');

  await app.listen(3001); // أو أي رقم آخر مثل 4000

   
}
bootstrap();
