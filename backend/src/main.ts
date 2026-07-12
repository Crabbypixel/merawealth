import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    //origin: "http://localhost:3000",
    origin: true,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
