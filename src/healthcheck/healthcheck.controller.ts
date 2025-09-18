import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from '../../db/models/User';

@ApiTags('health')
@Controller('api/v1/healthcheck')
export class HealthcheckController {
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Check if the API and database are accessible and functioning properly',
  })
  @ApiResponse({
    status: 200,
    description: 'API and database are healthy',
    schema: {
      type: 'object',
      properties: {
        OK: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Database connection failed or API is unhealthy',
  })
  async ping() {
    await User.findAll();
    return {
      OK: true,
    };
  }
}
