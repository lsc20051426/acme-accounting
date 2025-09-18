import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { TicketsService, CreateTicketDto, TicketDto } from './tickets.service';

@ApiTags('tickets')
@Controller('api/v1/tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all tickets',
    description:
      'Retrieve a list of all tickets with their details including company and assignee information',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all tickets',
    type: [TicketDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findAll() {
    return await this.ticketsService.findAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new ticket',
    description:
      'Create a new ticket for a company. The system will automatically assign the appropriate user based on ticket type and resolve existing tickets for strike-off requests.',
  })
  @ApiBody({
    type: CreateTicketDto,
    description: 'Ticket creation data',
    examples: {
      managementReport: {
        summary: 'Management Report Ticket',
        description: 'Create a management report ticket for accounting',
        value: {
          companyId: 1,
          type: 'managementReport',
        },
      },
      registrationAddressChange: {
        summary: 'Registration Address Change Ticket',
        description:
          'Create a registration address change ticket for corporate secretary',
        value: {
          companyId: 1,
          type: 'registrationAddressChange',
        },
      },
      strikeOff: {
        summary: 'Strike Off Ticket',
        description:
          'Create a strike off ticket for director (will resolve all other active tickets)',
        value: {
          companyId: 1,
          type: 'strikeOff',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket successfully created',
    type: TicketDto,
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - Duplicate ticket or multiple users with same role found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: {
          type: 'string',
          example:
            'An open registrationAddressChange ticket already exists for this company.',
        },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async create(@Body() createTicketDto: CreateTicketDto): Promise<TicketDto> {
    return await this.ticketsService.create(createTicketDto);
  }
}
