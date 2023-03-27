import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! and Hector!';
  }

  sayHello(name: string): string {
    return `Hello ${name} and Welcome to Nestjs!`;
  }
}
