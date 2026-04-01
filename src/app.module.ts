import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PersonModule } from './person/person.module.js';

@Module({
  imports: [PrismaModule, PersonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
