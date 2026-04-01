import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PersonModule } from './person/person.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [PrismaModule, PersonModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
