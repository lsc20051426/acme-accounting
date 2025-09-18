import { Module } from '@nestjs/common';
import { DbModule } from './db.module';
import { TicketsController } from './tickets/tickets.controller';
import { TicketsService } from './tickets/tickets.service';
import { ReportsController } from './reports/reports.controller';
import { HealthcheckController } from './healthcheck/healthcheck.controller';
import { ReportsService } from './reports/reports.service';

@Module({
  imports: [DbModule],
  controllers: [TicketsController, ReportsController, HealthcheckController],
  providers: [TicketsService, ReportsService],
})
export class AppModule {}
