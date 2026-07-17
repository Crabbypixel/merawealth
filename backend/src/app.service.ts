import { Injectable } from '@nestjs/common';

/*
 * Reserved for application-wide services that are not tied to a specific
 * business module. Currently unused, but can later host shared functionality
 * such as health checks, application metadata, version information, or other
 * global utilities.
 */

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
