import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import {
  TicketCategory,
  TicketStatus,
  TicketType,
} from '../../db/models/Ticket';
import { DbModule } from '../db.module';
import { TicketsController } from './tickets.controller';
import { TicketsService, CreateTicketDto, TicketDto } from './tickets.service';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: TicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [TicketsService],
      imports: [DbModule],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll and return tickets', async () => {
      const mockTickets: TicketDto[] = [
        {
          id: 1,
          type: TicketType.managementReport,
          companyId: 1,
          assigneeId: 1,
          status: TicketStatus.open,
          category: TicketCategory.accounting,
        },
        {
          id: 2,
          type: TicketType.registrationAddressChange,
          companyId: 2,
          assigneeId: 2,
          status: TicketStatus.resolved,
          category: TicketCategory.corporate,
        },
      ];

      const findAllSpy = jest
        .spyOn(service, 'findAll')
        .mockResolvedValue(mockTickets);

      const result = await controller.findAll();

      expect(findAllSpy).toHaveBeenCalled();
      expect(result).toEqual(mockTickets);
    });

    it('should return empty array when no tickets exist', async () => {
      const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll();

      expect(findAllSpy).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      const findAllSpy = jest
        .spyOn(service, 'findAll')
        .mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(error);
      expect(findAllSpy).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const mockTicketDto: TicketDto = {
      id: 1,
      type: TicketType.managementReport,
      companyId: 1,
      assigneeId: 1,
      status: TicketStatus.open,
      category: TicketCategory.accounting,
    };

    it('should call service.create with correct parameters for managementReport', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockTicketDto);

      const createTicketDto: CreateTicketDto = {
        companyId: 1,
        type: TicketType.managementReport,
      };

      const result = await controller.create(createTicketDto);

      expect(createSpy).toHaveBeenCalledWith(createTicketDto);
      expect(result).toEqual(mockTicketDto);
    });

    it('should call service.create with correct parameters for registrationAddressChange', async () => {
      const mockTicket: TicketDto = {
        id: 2,
        type: TicketType.registrationAddressChange,
        companyId: 2,
        assigneeId: 2,
        status: TicketStatus.open,
        category: TicketCategory.corporate,
      };

      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockTicket);

      const createTicketDto: CreateTicketDto = {
        companyId: 2,
        type: TicketType.registrationAddressChange,
      };

      const result = await controller.create(createTicketDto);

      expect(createSpy).toHaveBeenCalledWith(createTicketDto);
      expect(result).toEqual(mockTicket);
    });

    it('should call service.create with correct parameters for strikeOff', async () => {
      const mockTicket: TicketDto = {
        id: 3,
        type: TicketType.strikeOff,
        companyId: 3,
        assigneeId: 3,
        status: TicketStatus.open,
        category: TicketCategory.management,
      };

      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockTicket);

      const createTicketDto: CreateTicketDto = {
        companyId: 3,
        type: TicketType.strikeOff,
      };

      const result = await controller.create(createTicketDto);

      expect(createSpy).toHaveBeenCalledWith(createTicketDto);
      expect(result).toEqual(mockTicket);
    });

    it('should handle ConflictException from service', async () => {
      const conflictError = new ConflictException(
        'A registrationAddressChange ticket already exists for this company',
      );

      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(conflictError);

      const createTicketDto: CreateTicketDto = {
        companyId: 1,
        type: TicketType.registrationAddressChange,
      };

      await expect(controller.create(createTicketDto)).rejects.toThrow(
        conflictError,
      );
      expect(createSpy).toHaveBeenCalledWith(createTicketDto);
    });

    it('should handle generic service errors', async () => {
      const error = new Error('Database connection failed');

      const createSpy = jest.spyOn(service, 'create').mockRejectedValue(error);

      const createTicketDto: CreateTicketDto = {
        companyId: 1,
        type: TicketType.managementReport,
      };

      await expect(controller.create(createTicketDto)).rejects.toThrow(error);
      expect(createSpy).toHaveBeenCalledWith(createTicketDto);
    });

    it('should handle service errors when no assignee found', async () => {
      const noAssigneeError = new ConflictException(
        'Cannot find user with role accountant to create a ticket',
      );

      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(noAssigneeError);

      const createTicketDto: CreateTicketDto = {
        companyId: 1,
        type: TicketType.managementReport,
      };

      await expect(controller.create(createTicketDto)).rejects.toThrow(
        noAssigneeError,
      );
      expect(createSpy).toHaveBeenCalledWith(createTicketDto);
    });

    it('should handle service errors when multiple users found', async () => {
      const multipleUsersError = new ConflictException(
        'Multiple users with role corporateSecretary. Cannot create a ticket',
      );

      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(multipleUsersError);

      const createTicketDto: CreateTicketDto = {
        companyId: 1,
        type: TicketType.registrationAddressChange,
      };

      await expect(controller.create(createTicketDto)).rejects.toThrow(
        multipleUsersError,
      );
      expect(createSpy).toHaveBeenCalledWith(createTicketDto);
    });

    it('should handle service errors for unknown ticket type', async () => {
      const unknownTypeError = new ConflictException(
        'Unknown ticket type: invalidType',
      );

      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(unknownTypeError);

      const createTicketDto: CreateTicketDto = {
        companyId: 1,
        type: 'invalidType' as TicketType,
      };

      await expect(controller.create(createTicketDto)).rejects.toThrow(
        unknownTypeError,
      );
      expect(createSpy).toHaveBeenCalledWith(createTicketDto);
    });

    it('should pass through the exact DTO received from request body', async () => {
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockTicketDto);

      const createTicketDto: CreateTicketDto = {
        companyId: 999,
        type: TicketType.strikeOff,
      };

      await controller.create(createTicketDto);

      expect(createSpy).toHaveBeenCalledWith(createTicketDto);
      expect(createSpy).toHaveBeenCalledTimes(1);
    });
  });
});
