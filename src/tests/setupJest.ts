import { Test } from '@nestjs/testing';
import { DestroyOptions } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';
import { Company } from '../../db/models/Company';
import { Ticket } from '../../db/models/Ticket';
import { User } from '../../db/models/User';
import { DbModule } from '../db.module';

beforeEach(async () => {
  jest.restoreAllMocks();
  await cleanTables();
});

export async function cleanTables() {
  const module = await Test.createTestingModule({
    imports: [DbModule],
  }).compile();

  await cleanTable(Ticket);
  await cleanTable(User);
  await cleanTable(Company);

  await module.close();

  async function cleanTable<T extends Model>(model: ModelCtor<T>) {
    const options: DestroyOptions = {
      where: {},
      force: true,
      truncate: true,
    };
    try {
      await model.unscoped().destroy(options);
    } catch (err) {
      // https://github.com/sequelize/sequelize/issues/14807
      console.error(err as Error);
      // Don't throw the error, just log it to prevent test failures
      // This is a known issue with Sequelize cleanup
    }
  }
}
