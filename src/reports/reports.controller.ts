import { Controller, Get, Post, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('api/v1/reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get report status',
    description:
      'Retrieve the current status of all report generation processes',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved report status',
    schema: {
      type: 'object',
      properties: {
        'accounts.csv': { type: 'string', example: 'generated' },
        'yearly.csv': { type: 'string', example: 'generated' },
        'fs.csv': { type: 'string', example: 'generated' },
      },
    },
  })
  async report(): Promise<Record<string, string>> {
    return await this.reportsService.getReportStatus();
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Generate all reports',
    description:
      'Trigger the generation of all accounting reports (accounts, yearly, and financial statements)',
  })
  @ApiResponse({
    status: 201,
    description: 'Reports generation started successfully in background',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Report generation started' },
        status: { type: 'string', example: 'processing' },
        timestamp: { type: 'string', example: '2025-09-18T10:30:00.000Z' },
      },
    },
  })
  async generate() {
    // Start background processing and return immediately
    await this.reportsService.startReportGeneration();
    return {
      message: 'Report generation started',
      status: 'processing',
      timestamp: new Date().toISOString(),
    };
  }
}
