import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeModuleOptions } from '@nestjs/sequelize/dist/interfaces/sequelize-options.interface';
import { Company } from '../db/models/Company';
import { Ticket } from '../db/models/Ticket';
import { User } from '../db/models/User';
import { ReportJob } from '../db/models/ReportJob';
import dbConfig from '../db/config/config.json';

const devConfig = dbConfig.development as SequelizeModuleOptions;
const testConfig = dbConfig.test as SequelizeModuleOptions;

const config = process.env.NODE_ENV === 'test' ? testConfig : devConfig;

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...config,
      models: [Company, User, Ticket, ReportJob],
    }),
  ],
})
export class DbModule {}
