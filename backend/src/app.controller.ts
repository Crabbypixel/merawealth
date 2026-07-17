import { Body, Post, Controller, Get } from '@nestjs/common';

/*
 * Basic application controller used for development and health checks.
 *
 * - GET /hello : Confirms that the backend is running and reachable.
 * - POST /echo : Utility endpoint for testing request parsing during development.
 *
 * These endpoints are independent of the application's business logic.
 * This controller may later be replaced with a dedicated HealthModule.
 */

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
