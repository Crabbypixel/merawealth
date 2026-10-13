import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from "cookie-parser";
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Behind nginx on the same server, read the visitor's real IP from X-Forwarded-For.
    // Only trusted when the request comes from this machine, so it can't be faked.
    app.set("trust proxy", "loopback");

    // Standard security headers. Images in /uploads stay loadable from the website.
    app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
    
    // Enable cookie parsing middleware to handle cookies in requests.
    app.use(cookieParser());

    // Enable CORS (Cross-Origin Resource Sharing) to allow requests from the frontend application.
    app.enableCors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true
        })
    );

    // Start the NestJS application and listen on the specified port (default: 3001).
    await app.listen(process.env.PORT ?? 3001);
}

// This is the main entry point for the NestJS application.
bootstrap();
