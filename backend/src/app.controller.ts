import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      status: 'ok',
      message: 'DiagramGenie API is running',
      version: '2.0',
      uptime: process.uptime()
    };
  }
}
