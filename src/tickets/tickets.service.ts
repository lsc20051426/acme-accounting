import { ConflictException, Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../../db/models/Company';
import {
  Ticket,
  TicketCategory,
  TicketStatus,
  TicketType,
} from '../../db/models/Ticket';
import { User, UserRole } from '../../db/models/User';

export class CreateTicketDto {
  @ApiProperty({
    description: 'The type of ticket to create',
    enum: TicketType,
    example: TicketType.managementReport,
    enumName: 'TicketType',
  })
  type: TicketType;

  @ApiProperty({
    description: 'The ID of the company for which the ticket is being created',
    example: 1,
    minimum: 1,
  })
  companyId: number;
}

export class TicketDto {
  @ApiProperty({
    description: 'Unique identifier for the ticket',
    example: 1,
    minimum: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The type of the ticket',
    enum: TicketType,
    example: TicketType.managementReport,
    enumName: 'TicketType',
  })
  type: TicketType;

  @ApiProperty({
    description: 'The ID of the company this ticket belongs to',
    example: 1,
    minimum: 1,
  })
  companyId: number;

  @ApiProperty({
    description: 'The ID of the user assigned to this ticket',
    example: 1,
    minimum: 1,
  })
  assigneeId: number;

  @ApiProperty({
    description: 'Current status of the ticket',
    enum: TicketStatus,
    example: TicketStatus.open,
    enumName: 'TicketStatus',
  })
  status: TicketStatus;

  @ApiProperty({
    description: 'Category of the ticket',
    enum: TicketCategory,
    example: TicketCategory.accounting,
    enumName: 'TicketCategory',
  })
  category: TicketCategory;
}

@Injectable()
export class TicketsService {
  async findAll(): Promise<TicketDto[]> {
    const tickets = await Ticket.findAll({ include: [Company, User] });

    return tickets.map((ticket) => ({
      id: ticket.id,
      type: ticket.type,
      status: ticket.status,
      category: ticket.category,
      companyId: ticket.companyId,
      assigneeId: ticket.assigneeId,
    }));
  }

  async create(createTicketDto: CreateTicketDto): Promise<TicketDto> {
    const { type, companyId } = createTicketDto;

    // Handle strikeOff ticket type
    if (type === TicketType.strikeOff) {
      return await this.createStrikeOffTicket(companyId);
    }

    // Check for duplication for registrationAddressChange tickets
    if (type === TicketType.registrationAddressChange) {
      await this.checkForDuplicateRegistrationAddressChange(companyId);
    }

    const category = this.getTicketCategory(type);
    const userRole = this.getUserRole(type);

    const assignee = await this.findAssignee(companyId, userRole, type);
    return await this.createTicket(companyId, assignee.id, category, type);
  }

  private async checkForDuplicateRegistrationAddressChange(
    companyId: number,
  ): Promise<void> {
    const existingTicket = await Ticket.findOne({
      where: {
        companyId,
        type: TicketType.registrationAddressChange,
        status: TicketStatus.open,
      },
    });

    if (existingTicket) {
      throw new ConflictException(
        'A registrationAddressChange ticket already exists for this company',
      );
    }
  }

  private getTicketCategory(type: TicketType): TicketCategory {
    switch (type) {
      case TicketType.managementReport:
        return TicketCategory.accounting;
      case TicketType.registrationAddressChange:
        return TicketCategory.corporate;
      case TicketType.strikeOff:
        return TicketCategory.management;
      default:
        throw new ConflictException(`Unknown ticket type: ${String(type)}`);
    }
  }

  private getUserRole(type: TicketType): UserRole {
    switch (type) {
      case TicketType.managementReport:
        return UserRole.accountant;
      case TicketType.registrationAddressChange:
        return UserRole.corporateSecretary;
      case TicketType.strikeOff:
        return UserRole.director;
      default:
        throw new ConflictException(`Unknown ticket type: ${String(type)}`);
    }
  }

  private async findAssignee(
    companyId: number,
    userRole: UserRole,
    ticketType: TicketType,
  ): Promise<User> {
    const assignees = await User.findAll({
      where: { companyId, role: userRole },
      order: [['createdAt', 'DESC']],
    });

    // Handle Director fallback for registrationAddressChange
    if (
      !assignees.length &&
      ticketType === TicketType.registrationAddressChange
    ) {
      return await this.findDirectorFallback(companyId, userRole);
    }

    if (!assignees.length) {
      throw new ConflictException(
        `Cannot find user with role ${String(userRole)} to create a ticket`,
      );
    }

    if (userRole === UserRole.corporateSecretary && assignees.length > 1) {
      throw new ConflictException(
        `Multiple users with role ${userRole}. Cannot create a ticket`,
      );
    }

    return assignees[0];
  }

  private async findDirectorFallback(
    companyId: number,
    originalRole: UserRole,
  ): Promise<User> {
    const directors = await User.findAll({
      where: { companyId, role: UserRole.director },
      order: [['createdAt', 'DESC']],
    });

    if (!directors.length) {
      throw new ConflictException(
        `Cannot find user with role ${String(originalRole)} or Director to create a ticket`,
      );
    }

    if (directors.length > 1) {
      throw new ConflictException(
        `Multiple users with role Director. Cannot create a ticket`,
      );
    }

    return directors[0];
  }

  private async createStrikeOffTicket(companyId: number): Promise<TicketDto> {
    const director = await this.findDirectorForStrikeOff(companyId);

    // Resolve all other active tickets in the company
    await this.resolveAllActiveTickets(companyId);

    return await this.createTicket(
      companyId,
      director.id,
      TicketCategory.management,
      TicketType.strikeOff,
    );
  }

  private async findDirectorForStrikeOff(companyId: number): Promise<User> {
    const directors = await User.findAll({
      where: { companyId, role: UserRole.director },
      order: [['createdAt', 'DESC']],
    });

    if (!directors.length) {
      throw new ConflictException(
        `Cannot find user with role Director to create a strikeOff ticket`,
      );
    }

    if (directors.length > 1) {
      throw new ConflictException(
        `Multiple users with role Director. Cannot create a strikeOff ticket`,
      );
    }

    return directors[0];
  }

  private async resolveAllActiveTickets(companyId: number): Promise<void> {
    await Ticket.update(
      { status: TicketStatus.resolved },
      {
        where: {
          companyId,
          status: TicketStatus.open,
        },
      },
    );
  }

  private async createTicket(
    companyId: number,
    assigneeId: number,
    category: TicketCategory,
    type: TicketType,
  ): Promise<TicketDto> {
    const ticket = await Ticket.create({
      companyId,
      assigneeId,
      category,
      type,
      status: TicketStatus.open,
    });

    return {
      id: ticket.id,
      type: ticket.type,
      assigneeId: ticket.assigneeId,
      status: ticket.status,
      category: ticket.category,
      companyId: ticket.companyId,
    };
  }
}
