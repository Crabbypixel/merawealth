import { Body, Post, Controller, Get } from '@nestjs/common';
import { VerifyOtpDto } from './auth/dto/verify-otp.dto';

interface GreetingResponse {
  message: string;
  framework: string;
  year: number;
}

@Controller()
export class AppController {
  @Get("hello")
  getGreeting(): GreetingResponse {
    return {
      message: "Hello from NestJS",
      framework: "NestJS",
      year: 2026
    };
  }
  
  @Post("echo")
  verifyOtp(@Body() body : any) {
      return {
        received: body,
      }
  }
}
