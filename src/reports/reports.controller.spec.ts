import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            getReportStatus: jest.fn(),
            startReportGeneration: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('report (GET /api/v1/reports)', () => {
    it('should return report status from service', async () => {
      const mockStatus = {
        'accounts.csv': 'completed in 1500ms',
        'yearly.csv': 'processing',
        'fs.csv': 'idle',
      };

      jest.spyOn(service, 'getReportStatus').mockResolvedValue(mockStatus);

      const result = await controller.report();

      expect(service.getReportStatus).toHaveBeenCalled();
      expect(result).toEqual(mockStatus);
    });

    it('should return idle status when no jobs exist', async () => {
      const mockStatus = {
        'accounts.csv': 'idle',
        'yearly.csv': 'idle',
        'fs.csv': 'idle',
      };

      jest.spyOn(service, 'getReportStatus').mockResolvedValue(mockStatus);

      const result = await controller.report();

      expect(result).toEqual(mockStatus);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      jest.spyOn(service, 'getReportStatus').mockRejectedValue(error);

      await expect(controller.report()).rejects.toThrow(error);
    });
  });

  describe('generate (POST /api/v1/reports)', () => {
    it('should start report generation and return success response', async () => {
      jest.spyOn(service, 'startReportGeneration').mockResolvedValue();

      const result = await controller.generate();

      expect(service.startReportGeneration).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Report generation started',
        status: 'processing',
        timestamp: expect.any(String),
      });
    });

    it('should return valid timestamp in response', async () => {
      jest.spyOn(service, 'startReportGeneration').mockResolvedValue();

      const result = await controller.generate();

      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
    });

    it('should handle service errors during generation', async () => {
      const error = new Error('Failed to create jobs');
      jest.spyOn(service, 'startReportGeneration').mockRejectedValue(error);

      await expect(controller.generate()).rejects.toThrow(error);
    });

    it('should return consistent response structure', async () => {
      jest.spyOn(service, 'startReportGeneration').mockResolvedValue();

      const result = await controller.generate();

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.message).toBe('string');
      expect(typeof result.status).toBe('string');
      expect(typeof result.timestamp).toBe('string');
    });
  });

  describe('API Response Format', () => {
    it('should return proper JSON structure for GET request', async () => {
      const mockStatus = {
        'accounts.csv': 'completed in 1000ms',
        'yearly.csv': 'failed: File not found',
        'fs.csv': 'processing',
      };

      jest.spyOn(service, 'getReportStatus').mockResolvedValue(mockStatus);

      const result = await controller.report();

      expect(JSON.stringify(result)).toContain('accounts.csv');
      expect(JSON.stringify(result)).toContain('yearly.csv');
      expect(JSON.stringify(result)).toContain('fs.csv');
    });

    it('should return proper JSON structure for POST request', async () => {
      jest.spyOn(service, 'startReportGeneration').mockResolvedValue();

      const result = await controller.generate();

      expect(JSON.stringify(result)).toContain('message');
      expect(JSON.stringify(result)).toContain('status');
      expect(JSON.stringify(result)).toContain('timestamp');
    });
  });

  describe('Error Handling', () => {
    it('should propagate service errors for GET request', async () => {
      const error = new Error('Service unavailable');
      jest.spyOn(service, 'getReportStatus').mockRejectedValue(error);

      await expect(controller.report()).rejects.toThrow(error);
    });

    it('should propagate service errors for POST request', async () => {
      const error = new Error('Database error');
      jest.spyOn(service, 'startReportGeneration').mockRejectedValue(error);

      await expect(controller.generate()).rejects.toThrow(error);
    });
  });

  describe('Service Integration', () => {
    it('should call service methods exactly once per request', async () => {
      const getStatusSpy = jest.spyOn(service, 'getReportStatus').mockResolvedValue({});
      const startGenerationSpy = jest.spyOn(service, 'startReportGeneration').mockResolvedValue();

      await controller.report();
      await controller.generate();

      expect(getStatusSpy).toHaveBeenCalledTimes(1);
      expect(startGenerationSpy).toHaveBeenCalledTimes(1);
    });

    it('should not modify service response data', async () => {
      const originalStatus = {
        'accounts.csv': 'completed in 2000ms',
        'yearly.csv': 'processing',
        'fs.csv': 'idle',
      };

      jest.spyOn(service, 'getReportStatus').mockResolvedValue(originalStatus);

      const result = await controller.report();

      expect(result).toBe(originalStatus);
      expect(result).toEqual(originalStatus);
    });
  });
});
