import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Company } from '../../db/models/Company';
import {
  Ticket,
  TicketCategory,
  TicketStatus,
  TicketType,
} from '../../db/models/Ticket';
import { User, UserRole } from '../../db/models/User';
import { DbModule } from '../db.module';
import { TicketsService } from './tickets.service';

describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketsService],
      imports: [DbModule],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  describe('findAll', () => {
    it('should return all tickets with company and user relations', async () => {
      const result = await service.findAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('create', () => {
    describe('managementReport', () => {
      it('creates managementReport ticket', async () => {
        const company = await Company.create({ name: 'test' });
        const user = await User.create({
          name: 'Test User',
          role: UserRole.accountant,
          companyId: company.id,
        });

        const ticket = await service.create({
          companyId: company.id,
          type: TicketType.managementReport,
        });

        expect(ticket.category).toBe(TicketCategory.accounting);
        expect(ticket.assigneeId).toBe(user.id);
        expect(ticket.status).toBe(TicketStatus.open);
        expect(ticket.type).toBe(TicketType.managementReport);
      });

      it('if there are multiple accountants, assign the last one', async () => {
        const company = await Company.create({ name: 'test' });
        await User.create({
          name: 'Test User 1',
          role: UserRole.accountant,
          companyId: company.id,
        });
        const user2 = await User.create({
          name: 'Test User 2',
          role: UserRole.accountant,
          companyId: company.id,
        });

        const ticket = await service.create({
          companyId: company.id,
          type: TicketType.managementReport,
        });

        expect(ticket.category).toBe(TicketCategory.accounting);
        expect(ticket.assigneeId).toBe(user2.id);
        expect(ticket.status).toBe(TicketStatus.open);
      });

      it('if there is no accountant, throw', async () => {
        const company = await Company.create({ name: 'test' });

        await expect(
          service.create({
            companyId: company.id,
            type: TicketType.managementReport,
          }),
        ).rejects.toEqual(
          new ConflictException(
            `Cannot find user with role accountant to create a ticket`,
          ),
        );
      });
    });

    describe('registrationAddressChange', () => {
      it('creates registrationAddressChange ticket', async () => {
        const company = await Company.create({ name: 'test' });
        const user = await User.create({
          name: 'Test User',
          role: UserRole.corporateSecretary,
          companyId: company.id,
        });

        const ticket = await service.create({
          companyId: company.id,
          type: TicketType.registrationAddressChange,
        });

        expect(ticket.category).toBe(TicketCategory.corporate);
        expect(ticket.assigneeId).toBe(user.id);
        expect(ticket.status).toBe(TicketStatus.open);
        expect(ticket.type).toBe(TicketType.registrationAddressChange);
      });

      it('if there are multiple secretaries, throw', async () => {
        const company = await Company.create({ name: 'test' });
        await User.create({
          name: 'Test User 1',
          role: UserRole.corporateSecretary,
          companyId: company.id,
        });
        await User.create({
          name: 'Test User 2',
          role: UserRole.corporateSecretary,
          companyId: company.id,
        });

        await expect(
          service.create({
            companyId: company.id,
            type: TicketType.registrationAddressChange,
          }),
        ).rejects.toEqual(
          new ConflictException(
            `Multiple users with role corporateSecretary. Cannot create a ticket`,
          ),
        );
      });

      it('if there is no secretary but there is a director, assign to director', async () => {
        const company = await Company.create({ name: 'test' });
        const director = await User.create({
          name: 'Test Director',
          role: UserRole.director,
          companyId: company.id,
        });

        const ticket = await service.create({
          companyId: company.id,
          type: TicketType.registrationAddressChange,
        });

        expect(ticket.category).toBe(TicketCategory.corporate);
        expect(ticket.assigneeId).toBe(director.id);
        expect(ticket.status).toBe(TicketStatus.open);
      });

      it('if there are multiple directors when falling back, throw error', async () => {
        const company = await Company.create({ name: 'test' });
        await User.create({
          name: 'Test Director 1',
          role: UserRole.director,
          companyId: company.id,
        });
        await User.create({
          name: 'Test Director 2',
          role: UserRole.director,
          companyId: company.id,
        });

        await expect(
          service.create({
            companyId: company.id,
            type: TicketType.registrationAddressChange,
          }),
        ).rejects.toEqual(
          new ConflictException(
            `Multiple users with role Director. Cannot create a ticket`,
          ),
        );
      });

      it('if there is no secretary and no director, throw error', async () => {
        const company = await Company.create({ name: 'test' });

        await expect(
          service.create({
            companyId: company.id,
            type: TicketType.registrationAddressChange,
          }),
        ).rejects.toEqual(
          new ConflictException(
            `Cannot find user with role corporateSecretary or Director to create a ticket`,
          ),
        );
      });

      it('throws duplication error if registrationAddressChange ticket already exists', async () => {
        const company = await Company.create({ name: 'test' });
        await User.create({
          name: 'Test Secretary',
          role: UserRole.corporateSecretary,
          companyId: company.id,
        });

        // Create first ticket
        await service.create({
          companyId: company.id,
          type: TicketType.registrationAddressChange,
        });

        // Try to create second ticket - should throw error
        await expect(
          service.create({
            companyId: company.id,
            type: TicketType.registrationAddressChange,
          }),
        ).rejects.toEqual(
          new ConflictException(
            'A registrationAddressChange ticket already exists for this company',
          ),
        );
      });
    });

    describe('strikeOff', () => {
      it('creates strikeOff ticket and assigns to director', async () => {
        const company = await Company.create({ name: 'test' });
        const director = await User.create({
          name: 'Test Director',
          role: UserRole.director,
          companyId: company.id,
        });

        const ticket = await service.create({
          companyId: company.id,
          type: TicketType.strikeOff,
        });

        expect(ticket.category).toBe(TicketCategory.management);
        expect(ticket.assigneeId).toBe(director.id);
        expect(ticket.status).toBe(TicketStatus.open);
        expect(ticket.type).toBe(TicketType.strikeOff);
      });

      it('if there are multiple directors, throw error', async () => {
        const company = await Company.create({ name: 'test' });
        await User.create({
          name: 'Test Director 1',
          role: UserRole.director,
          companyId: company.id,
        });
        await User.create({
          name: 'Test Director 2',
          role: UserRole.director,
          companyId: company.id,
        });

        await expect(
          service.create({
            companyId: company.id,
            type: TicketType.strikeOff,
          }),
        ).rejects.toEqual(
          new ConflictException(
            `Multiple users with role Director. Cannot create a strikeOff ticket`,
          ),
        );
      });

      it('if there is no director, throw error', async () => {
        const company = await Company.create({ name: 'test' });

        await expect(
          service.create({
            companyId: company.id,
            type: TicketType.strikeOff,
          }),
        ).rejects.toEqual(
          new ConflictException(
            `Cannot find user with role Director to create a strikeOff ticket`,
          ),
        );
      });

      it('resolves all other active tickets when creating strikeOff ticket', async () => {
        const company = await Company.create({ name: 'test' });
        const director = await User.create({
          name: 'Test Director',
          role: UserRole.director,
          companyId: company.id,
        });
        const accountant = await User.create({
          name: 'Test Accountant',
          role: UserRole.accountant,
          companyId: company.id,
        });

        // Create some existing tickets
        const ticket1 = await Ticket.create({
          companyId: company.id,
          assigneeId: accountant.id,
          category: TicketCategory.accounting,
          type: TicketType.managementReport,
          status: TicketStatus.open,
        });

        const ticket2 = await Ticket.create({
          companyId: company.id,
          assigneeId: director.id,
          category: TicketCategory.corporate,
          type: TicketType.registrationAddressChange,
          status: TicketStatus.open,
        });

        // Create strikeOff ticket
        const strikeOffTicket = await service.create({
          companyId: company.id,
          type: TicketType.strikeOff,
        });

        // Check that strikeOff ticket was created
        expect(strikeOffTicket.type).toBe(TicketType.strikeOff);
        expect(strikeOffTicket.status).toBe(TicketStatus.open);

        // Check that other tickets were resolved
        await ticket1.reload();
        await ticket2.reload();
        expect(ticket1.status).toBe(TicketStatus.resolved);
        expect(ticket2.status).toBe(TicketStatus.resolved);
      });
    });
  });

  describe('private methods', () => {
    describe('getTicketCategory', () => {
      it('should return correct category for managementReport', () => {
        const category = (
          service as unknown as {
            getTicketCategory: (type: TicketType) => TicketCategory;
          }
        ).getTicketCategory(TicketType.managementReport);
        expect(category).toBe(TicketCategory.accounting);
      });

      it('should return correct category for registrationAddressChange', () => {
        const category = (
          service as unknown as {
            getTicketCategory: (type: TicketType) => TicketCategory;
          }
        ).getTicketCategory(TicketType.registrationAddressChange);
        expect(category).toBe(TicketCategory.corporate);
      });

      it('should return correct category for strikeOff', () => {
        const category = (
          service as unknown as {
            getTicketCategory: (type: TicketType) => TicketCategory;
          }
        ).getTicketCategory(TicketType.strikeOff);
        expect(category).toBe(TicketCategory.management);
      });

      it('should throw error for unknown ticket type', () => {
        expect(() => {
          (
            service as unknown as {
              getTicketCategory: (type: TicketType) => TicketCategory;
            }
          ).getTicketCategory('unknown' as TicketType);
        }).toThrow(ConflictException);
      });
    });

    describe('getUserRole', () => {
      it('should return correct role for managementReport', () => {
        const role = (
          service as unknown as { getUserRole: (type: TicketType) => UserRole }
        ).getUserRole(TicketType.managementReport);
        expect(role).toBe(UserRole.accountant);
      });

      it('should return correct role for registrationAddressChange', () => {
        const role = (
          service as unknown as { getUserRole: (type: TicketType) => UserRole }
        ).getUserRole(TicketType.registrationAddressChange);
        expect(role).toBe(UserRole.corporateSecretary);
      });

      it('should return correct role for strikeOff', () => {
        const role = (
          service as unknown as { getUserRole: (type: TicketType) => UserRole }
        ).getUserRole(TicketType.strikeOff);
        expect(role).toBe(UserRole.director);
      });

      it('should throw error for unknown ticket type', () => {
        expect(() => {
          (
            service as unknown as {
              getUserRole: (type: TicketType) => UserRole;
            }
          ).getUserRole('unknown' as TicketType);
        }).toThrow(ConflictException);
      });
    });

    describe('checkForDuplicateRegistrationAddressChange', () => {
      it('should not throw if no duplicate exists', async () => {
        const company = await Company.create({ name: 'test' });

        await expect(
          (
            service as unknown as {
              checkForDuplicateRegistrationAddressChange: (
                companyId: number,
              ) => Promise<void>;
            }
          ).checkForDuplicateRegistrationAddressChange(company.id),
        ).resolves.not.toThrow();
      });

      it('should throw if duplicate exists', async () => {
        const company = await Company.create({ name: 'test' });
        const secretary = await User.create({
          name: 'Test Secretary',
          role: UserRole.corporateSecretary,
          companyId: company.id,
        });

        // Create first ticket
        await Ticket.create({
          companyId: company.id,
          assigneeId: secretary.id,
          category: TicketCategory.corporate,
          type: TicketType.registrationAddressChange,
          status: TicketStatus.open,
        });

        await expect(
          (
            service as unknown as {
              checkForDuplicateRegistrationAddressChange: (
                companyId: number,
              ) => Promise<void>;
            }
          ).checkForDuplicateRegistrationAddressChange(company.id),
        ).rejects.toEqual(
          new ConflictException(
            'A registrationAddressChange ticket already exists for this company',
          ),
        );
      });
    });

    describe('resolveAllActiveTickets', () => {
      it('should resolve all open tickets for a company', async () => {
        const company = await Company.create({ name: 'test' });
        const user = await User.create({
          name: 'Test User',
          role: UserRole.accountant,
          companyId: company.id,
        });

        // Create some tickets
        const ticket1 = await Ticket.create({
          companyId: company.id,
          assigneeId: user.id,
          category: TicketCategory.accounting,
          type: TicketType.managementReport,
          status: TicketStatus.open,
        });

        const ticket2 = await Ticket.create({
          companyId: company.id,
          assigneeId: user.id,
          category: TicketCategory.accounting,
          type: TicketType.managementReport,
          status: TicketStatus.open,
        });

        // Resolve all active tickets
        await (
          service as unknown as {
            resolveAllActiveTickets: (companyId: number) => Promise<void>;
          }
        ).resolveAllActiveTickets(company.id);

        // Check that tickets were resolved
        await ticket1.reload();
        await ticket2.reload();
        expect(ticket1.status).toBe(TicketStatus.resolved);
        expect(ticket2.status).toBe(TicketStatus.resolved);
      });
    });
  });
});
