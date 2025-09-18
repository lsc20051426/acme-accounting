import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ReportJob, ReportJobStatus, ReportType } from '../../db/models/ReportJob';
import { DbModule } from '../db.module';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock performance module
jest.mock('perf_hooks', () => ({
  performance: {
    now: jest.fn(() => 1000),
  },
}));

describe('ReportsService', () => {
  let service: ReportsService;
  let mockJobs: ReportJob[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsService],
      imports: [DbModule],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    mockJobs = [
      {
        id: 1,
        reportType: ReportType.accounts,
        status: ReportJobStatus.completed,
        processingTimeMs: 1500,
        createdAt: new Date('2023-01-01'),
      } as ReportJob,
      {
        id: 2,
        reportType: ReportType.yearly,
        status: ReportJobStatus.processing,
        createdAt: new Date('2023-01-02'),
      } as ReportJob,
      {
        id: 3,
        reportType: ReportType.fs,
        status: ReportJobStatus.failed,
        error: 'Test error',
        createdAt: new Date('2023-01-03'),
      } as ReportJob,
      {
        id: 4,
        reportType: ReportType.fs,
        status: ReportJobStatus.pending,
        error: '',
        createdAt: new Date('2023-01-02'),
      } as ReportJob,
      {
        id: 5,
        reportType: ReportType.fs,
        status: ReportJobStatus.failed,
        error: 'Test error',
        createdAt: new Date('2023-01-04'),
      } as ReportJob,
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getReportStatus', () => {
    it('should return idle status when no jobs exist', async () => {
      // Mock empty job results
      jest.spyOn(ReportJob, 'findAll').mockResolvedValue([]);

      const result = await service.getReportStatus();

      expect(result).toEqual({
        'accounts.csv': 'idle',
        'yearly.csv': 'idle',
        'fs.csv': 'idle',
      });
    });

    it('should return latest job status for each report type', async () => {
      jest.spyOn(ReportJob, 'findAll').mockResolvedValue(mockJobs);
      const result = await service.getReportStatus();
      expect(result).toEqual({
        'accounts.csv': 'completed in 1500ms',
        'yearly.csv': 'processing',
        'fs.csv': 'failed: Test error',
      });
    });
  });

  describe('startReportGeneration', () => {
    it('should create jobs for all report types and start background processing', async () => {
      // Mock ReportJob.create to return different mock jobs for each call
      const mockCreatedJobs = [
        { id: 1, reportType: ReportType.accounts } as ReportJob,
        { id: 2, reportType: ReportType.yearly } as ReportJob,
        { id: 3, reportType: ReportType.fs } as ReportJob,
      ];
      const createSpy = jest.spyOn(ReportJob, 'create')
        .mockResolvedValueOnce(mockCreatedJobs[0])
        .mockResolvedValueOnce(mockCreatedJobs[1])
        .mockResolvedValueOnce(mockCreatedJobs[2]);

      // Mock processReport method to prevent actual processing
      const processReportSpy = jest.spyOn(service as any, 'processReport').mockResolvedValue(undefined);

      // Mock setImmediate to prevent background processing
      const setImmediateSpy = jest.spyOn(global, 'setImmediate').mockImplementation((callback) => {
        // Execute the callback immediately for testing
        callback();
        return {} as NodeJS.Immediate;
      });

      await service.startReportGeneration();

      // Verify that jobs were created for all report types
      expect(createSpy).toHaveBeenCalledTimes(3);
      expect(createSpy).toHaveBeenCalledWith({ reportType: ReportType.accounts });
      expect(createSpy).toHaveBeenCalledWith({ reportType: ReportType.yearly });
      expect(createSpy).toHaveBeenCalledWith({ reportType: ReportType.fs });

      // Verify that setImmediate was called
      expect(setImmediateSpy).toHaveBeenCalledTimes(1);

      // Verify that processReport was called for each job
      expect(processReportSpy).toHaveBeenCalledTimes(3);
      expect(processReportSpy).toHaveBeenCalledWith(mockCreatedJobs[0], expect.any(Function));
      expect(processReportSpy).toHaveBeenCalledWith(mockCreatedJobs[1], expect.any(Function));
      expect(processReportSpy).toHaveBeenCalledWith(mockCreatedJobs[2], expect.any(Function));

      // Clean up
      setImmediateSpy.mockRestore();
    });

    it('should handle errors when creating jobs', async () => {
      // Mock ReportJob.create to throw an error
      const createSpy = jest.spyOn(ReportJob, 'create').mockRejectedValue(new Error('Database error'));

      // Mock setImmediate to prevent background processing
      const setImmediateSpy = jest.spyOn(global, 'setImmediate').mockImplementation(() => {
        return {} as NodeJS.Immediate;
      });

      await expect(service.startReportGeneration()).rejects.toThrow('Database error');

      // Verify that create was called (at least once before failing)
      expect(createSpy).toHaveBeenCalled();

      // Clean up
      setImmediateSpy.mockRestore();
    });
  });

  describe('processAllReports', () => {
    it('should process all reports in parallel using the mapping approach', async () => {
      // Create mock jobs with different report types
      const mockJobs = [
        { id: 1, reportType: ReportType.accounts } as ReportJob,
        { id: 2, reportType: ReportType.yearly } as ReportJob,
        { id: 3, reportType: ReportType.fs } as ReportJob,
      ];

      // Mock processReport method
      const processReportSpy = jest.spyOn(service as any, 'processReport').mockResolvedValue(undefined);

      // Call the private method with proper binding
      await (service as any).processAllReports(mockJobs);

      // Verify that processReport was called for each job
      expect(processReportSpy).toHaveBeenCalledTimes(3);

      // Verify that processReport was called with the correct job and function for each report type
      expect(processReportSpy).toHaveBeenCalledWith(
        mockJobs[0],
        expect.any(Function) // accounts function
      );
      expect(processReportSpy).toHaveBeenCalledWith(
        mockJobs[1],
        expect.any(Function) // yearly function
      );
      expect(processReportSpy).toHaveBeenCalledWith(
        mockJobs[2],
        expect.any(Function) // fs function
      );

      // Verify that the functions are different (not the same reference)
      const calls = processReportSpy.mock.calls;
      expect(calls[0][1]).not.toBe(calls[1][1]); // accounts !== yearly
      expect(calls[1][1]).not.toBe(calls[2][1]); // yearly !== fs
      expect(calls[0][1]).not.toBe(calls[2][1]); // accounts !== fs
    });

    it('should handle jobs in any order', async () => {
      // Create mock jobs in different order
      const mockJobs = [
        { id: 3, reportType: ReportType.fs } as ReportJob,
        { id: 1, reportType: ReportType.accounts } as ReportJob,
        { id: 2, reportType: ReportType.yearly } as ReportJob,
      ];

      // Mock processReport method
      const processReportSpy = jest.spyOn(service as any, 'processReport').mockResolvedValue(undefined);

      // Call the private method with proper binding
      await (service as any).processAllReports(mockJobs);

      // Verify that processReport was called for each job regardless of order
      expect(processReportSpy).toHaveBeenCalledTimes(3);

      // Verify that each job was processed with its correct function
      expect(processReportSpy).toHaveBeenCalledWith(mockJobs[0], expect.any(Function)); // fs
      expect(processReportSpy).toHaveBeenCalledWith(mockJobs[1], expect.any(Function)); // accounts
      expect(processReportSpy).toHaveBeenCalledWith(mockJobs[2], expect.any(Function)); // yearly
    });

    it('should handle empty jobs array', async () => {
      // Mock processReport method
      const processReportSpy = jest.spyOn(service as any, 'processReport').mockResolvedValue(undefined);

      // Call the private method with empty array
      await (service as any).processAllReports([]);

      // Verify that processReport was not called
      expect(processReportSpy).not.toHaveBeenCalled();
    });

    it('should handle partial job types', async () => {
      // Create mock jobs with only some report types
      const mockJobs = [
        { id: 1, reportType: ReportType.accounts } as ReportJob,
        { id: 3, reportType: ReportType.fs } as ReportJob,
      ];

      // Mock processReport method
      const processReportSpy = jest.spyOn(service as any, 'processReport').mockResolvedValue(undefined);

      // Call the private method with proper binding
      await (service as any).processAllReports(mockJobs);

      // Verify that processReport was called only for the provided jobs
      expect(processReportSpy).toHaveBeenCalledTimes(2);
      expect(processReportSpy).toHaveBeenCalledWith(mockJobs[0], expect.any(Function)); // accounts
      expect(processReportSpy).toHaveBeenCalledWith(mockJobs[1], expect.any(Function)); // fs
    });

    it('should propagate errors from processReport', async () => {
      // Create mock jobs
      const mockJobs = [
        { id: 1, reportType: ReportType.accounts } as ReportJob,
        { id: 2, reportType: ReportType.yearly } as ReportJob,
      ];

      // Mock processReport to throw an error
      const processReportSpy = jest.spyOn(service as any, 'processReport').mockRejectedValue(new Error('Processing failed'));

      // Call the private method and expect it to throw
      await expect((service as any).processAllReports(mockJobs)).rejects.toThrow('Processing failed');

      // Verify that processReport was called
      expect(processReportSpy).toHaveBeenCalled();
    });
  });

  describe('processReport', () => {
    it('should successfully process a report and update job status', async () => {
      // Create a mock job
      const mockJob = {
        id: 1,
        reportType: ReportType.accounts,
        status: ReportJobStatus.pending,
        update: jest.fn().mockResolvedValue(undefined),
      } as unknown as ReportJob;

      // Mock process function
      const mockProcessFunction = jest.fn();

      // Mock performance.now to return consistent values
      const mockPerformance = require('perf_hooks').performance;
      mockPerformance.now
        .mockReturnValueOnce(1000) // start time
        .mockReturnValueOnce(1500); // end time

      // Call the private method
      const processReportMethod = (service as unknown as { processReport: (job: ReportJob, processFunction: () => void) => Promise<void> }).processReport;
      await processReportMethod(mockJob, mockProcessFunction);

      // Verify job was updated to processing
      expect(mockJob.update).toHaveBeenCalledWith({
        status: ReportJobStatus.processing,
        startedAt: expect.any(Date),
      });

      // Verify process function was called
      expect(mockProcessFunction).toHaveBeenCalledTimes(1);

      // Verify job was updated to completed
      expect(mockJob.update).toHaveBeenCalledWith({
        status: ReportJobStatus.completed,
        completedAt: expect.any(Date),
        processingTimeMs: 500, // 1500 - 1000
      });

      // Verify update was called exactly twice (processing + completed)
      expect(mockJob.update).toHaveBeenCalledTimes(2);
    });

    it('should handle errors and update job status to failed', async () => {
      // Create a mock job
      const mockJob = {
        id: 1,
        reportType: ReportType.accounts,
        status: ReportJobStatus.pending,
        update: jest.fn().mockResolvedValue(undefined),
      } as unknown as ReportJob;

      // Mock process function to throw an error
      const mockProcessFunction = jest.fn().mockImplementation(() => {
        throw new Error('Processing failed');
      });

      // Mock performance.now
      const mockPerformance = require('perf_hooks').performance;
      mockPerformance.now.mockReturnValue(1000);

      // Call the private method
      const processReportMethod = (service as unknown as { processReport: (job: ReportJob, processFunction: () => void) => Promise<void> }).processReport;
      await processReportMethod(mockJob, mockProcessFunction);

      // Verify job was updated to processing
      expect(mockJob.update).toHaveBeenCalledWith({
        status: ReportJobStatus.processing,
        startedAt: expect.any(Date),
      });

      // Verify process function was called
      expect(mockProcessFunction).toHaveBeenCalledTimes(1);

      // Verify job was updated to failed
      expect(mockJob.update).toHaveBeenCalledWith({
        status: ReportJobStatus.failed,
        completedAt: expect.any(Date),
        error: 'Processing failed',
      });

      // Verify update was called exactly twice (processing + failed)
      expect(mockJob.update).toHaveBeenCalledTimes(2);
    });

    it('should handle non-Error objects in catch block', async () => {
      // Create a mock job
      const mockJob = {
        id: 1,
        reportType: ReportType.accounts,
        status: ReportJobStatus.pending,
        update: jest.fn().mockResolvedValue(undefined),
      } as unknown as ReportJob;

      // Mock process function to throw a non-Error object
      const mockProcessFunction = jest.fn().mockImplementation(() => {
        throw 'String error';
      });

      // Mock performance.now
      const mockPerformance = require('perf_hooks').performance;
      mockPerformance.now.mockReturnValue(1000);

      // Call the private method
      const processReportMethod = (service as unknown as { processReport: (job: ReportJob, processFunction: () => void) => Promise<void> }).processReport;
      await processReportMethod(mockJob, mockProcessFunction);

      // Verify job was updated to failed with stringified error
      expect(mockJob.update).toHaveBeenCalledWith({
        status: ReportJobStatus.failed,
        completedAt: expect.any(Date),
        error: 'String error',
      });
    });
  });

  describe('formatJobStatus', () => {
    it('should format pending status', () => {
      const job = mockJobs[3];
      const result = (service as any).formatJobStatus(job);
      expect(result).toBe('pending');
    });

    it('should format processing status', () => {
      const job = mockJobs[1];
      const result = (service as any).formatJobStatus(job);
      expect(result).toBe('processing');
    });

    it('should format completed status with processing time', () => {
      const job = mockJobs[0];
      const result = (service as any).formatJobStatus(job);
      expect(result).toBe('completed in 1500ms');
    });

    it('should format failed status with error message', () => {
      const job = mockJobs[2];
      const result = (service as any).formatJobStatus(job);
      expect(result).toBe('failed: Test error');
    });

    it('should format unknown status', () => {
      const job = { status: 'unknown' as any } as ReportJob;
      const result = (service as any).formatJobStatus(job);
      expect(result).toBe('unknown');
    });
  });

  describe('file operations', () => {
    beforeEach(() => {
      // Mock fs operations
      mockedFs.readdirSync.mockReturnValue(['2023-01.csv', '2023-02.csv'] as any);
      mockedFs.readFileSync.mockReturnValue('date,account,desc,100,50\n2023-01-01,Cash,test,200,100');
      mockedFs.writeFileSync.mockImplementation(() => {});
    });

    it('should process accounts report', () => {
      const accountsMethod = (service as unknown as { accounts: () => void }).accounts;
      accountsMethod();

      expect(mockedFs.readdirSync).toHaveBeenCalledWith('tmp');
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        'out/accounts.csv',
        expect.stringContaining('Account,Balance')
      );
    });

    it('should process yearly report', () => {
      mockedFs.readdirSync.mockReturnValue(['2023-01.csv', 'yearly.csv'] as any);
      const yearlyMethod = (service as unknown as { yearly: () => void }).yearly;
      yearlyMethod();

      expect(mockedFs.readdirSync).toHaveBeenCalledWith('tmp');
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        'out/yearly.csv',
        expect.stringContaining('Financial Year,Cash Balance')
      );
    });

    it('should process financial statement report', () => {
      mockedFs.readdirSync.mockReturnValue(['2023-01.csv', 'fs.csv'] as any);
      const fsMethod = (service as unknown as { fs: () => void }).fs;
      fsMethod();

      expect(mockedFs.readdirSync).toHaveBeenCalledWith('tmp');
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        'out/fs.csv',
        expect.stringContaining('Basic Financial Statement')
      );
    });
  });
});