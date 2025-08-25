import { Module } from '@nestjs/common';
import { DbModule } from './db.module';
import { TicketsController } from './tickets/tickets.controller';
import { ReportsController } from './reports/reports.controller';
import { HealthcheckController } from './healthcheck/healthcheck.controller';
import { ReportsService } from './reports/reports.service';
import { CompaniesController } from './companies/companies.controller';
import { UsersController } from './users/users.controller';

@Module({
  imports: [DbModule],
  controllers: [
    TicketsController,
    ReportsController,
    HealthcheckController,
    CompaniesController,
    UsersController,
  ],
  providers: [ReportsService],
})
export class AppModule {}
