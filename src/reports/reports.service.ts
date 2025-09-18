import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import {
  ReportJob,
  ReportJobStatus,
  ReportType,
} from '../../db/models/ReportJob';

@Injectable()
export class ReportsService {
  async getReportStatus(): Promise<Record<string, string>> {
    const jobs = await ReportJob.findAll({
      order: [['createdAt', 'DESC']],
    });

    const statusMap: Record<string, string> = {
      'accounts.csv': 'idle',
      'yearly.csv': 'idle',
      'fs.csv': 'idle',
    };

    // Get the latest job for each report type
    const latestJobs = new Map<ReportType, ReportJob>();
    jobs.forEach((job) => {
      if (
        !latestJobs.has(job.reportType) ||
        job.createdAt > latestJobs.get(job.reportType)!.createdAt
      ) {
        latestJobs.set(job.reportType, job);
      }
    });

    // Update status based on latest jobs
    latestJobs.forEach((job, reportType) => {
      const status = this.formatJobStatus(job);
      const fileName = `${reportType}.csv`;
      statusMap[fileName] = status;
    });

    return statusMap;
  }

  private formatJobStatus(job: ReportJob): string {
    switch (job.status) {
      case ReportJobStatus.pending:
        return 'pending';
      case ReportJobStatus.processing:
        return 'processing';
      case ReportJobStatus.completed:
        return `completed in ${job.processingTimeMs}ms`;
      case ReportJobStatus.failed:
        return `failed: ${job.error}`;
      default:
        return 'unknown';
    }
  }

  async startReportGeneration(): Promise<void> {
    // Create jobs for all report types
    const jobs = await Promise.all([
      ReportJob.create({ reportType: ReportType.accounts } as any),
      ReportJob.create({ reportType: ReportType.yearly } as any),
      ReportJob.create({ reportType: ReportType.fs } as any),
    ]);

    // Start background processing for all jobs in parallel
    setImmediate(() => {
      void this.processAllReports(jobs);
    });
  }

  private async processAllReports(jobs: ReportJob[]): Promise<void> {
    // Map report types to their corresponding processing functions
    const reportTypeToFunction = {
      [ReportType.accounts]: this.accounts,
      [ReportType.yearly]: this.yearly,
      [ReportType.fs]: this.fs,
    };

    // Process all reports in parallel
    await Promise.all(
      jobs.map((job) =>
        this.processReport(job, reportTypeToFunction[job.reportType])
      )
    );
  }

  private async processReport(
    job: ReportJob,
    processFunction: () => void,
  ): Promise<void> {
    try {
      // Update job status to processing
      await job.update({
        status: ReportJobStatus.processing,
        startedAt: new Date(),
      });

      const start = performance.now();

      // Execute the actual report processing
      processFunction();

      const processingTime = Math.round(performance.now() - start);

      // Update job status to completed
      await job.update({
        status: ReportJobStatus.completed,
        completedAt: new Date(),
        processingTimeMs: processingTime,
      });
    } catch (error) {
      // Update job status to failed
      await job.update({
        status: ReportJobStatus.failed,
        completedAt: new Date(),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private accounts() {
    const tmpDir = 'tmp';
    const outputFile = 'out/accounts.csv';
    const accountBalances: Record<string, number> = {};
    fs.readdirSync(tmpDir).forEach((file) => {
      if (file.endsWith('.csv')) {
        const lines = fs
          .readFileSync(path.join(tmpDir, file), 'utf-8')
          .trim()
          .split('\n');
        for (const line of lines) {
          const [, account, , debit, credit] = line.split(',');
          if (!accountBalances[account]) {
            accountBalances[account] = 0;
          }
          accountBalances[account] +=
            parseFloat(String(debit || 0)) - parseFloat(String(credit || 0));
        }
      }
    });
    const output = ['Account,Balance'];
    for (const [account, balance] of Object.entries(accountBalances)) {
      output.push(`${account},${balance.toFixed(2)}`);
    }
    fs.writeFileSync(outputFile, output.join('\n'));
  }

  private yearly() {
    const tmpDir = 'tmp';
    const outputFile = 'out/yearly.csv';
    const cashByYear: Record<string, number> = {};
    fs.readdirSync(tmpDir).forEach((file) => {
      if (file.endsWith('.csv') && file !== 'yearly.csv') {
        const lines = fs
          .readFileSync(path.join(tmpDir, file), 'utf-8')
          .trim()
          .split('\n');
        for (const line of lines) {
          const [date, account, , debit, credit] = line.split(',');
          if (account === 'Cash') {
            const year = new Date(date).getFullYear();
            if (!cashByYear[year]) {
              cashByYear[year] = 0;
            }
            cashByYear[year] +=
              parseFloat(String(debit || 0)) - parseFloat(String(credit || 0));
          }
        }
      }
    });
    const output = ['Financial Year,Cash Balance'];
    Object.keys(cashByYear)
      .sort()
      .forEach((year) => {
        output.push(`${year},${cashByYear[year].toFixed(2)}`);
      });
    fs.writeFileSync(outputFile, output.join('\n'));
  }

  private fs() {
    const tmpDir = 'tmp';
    const outputFile = 'out/fs.csv';
    const categories = {
      'Income Statement': {
        Revenues: ['Sales Revenue'],
        Expenses: [
          'Cost of Goods Sold',
          'Salaries Expense',
          'Rent Expense',
          'Utilities Expense',
          'Interest Expense',
          'Tax Expense',
        ],
      },
      'Balance Sheet': {
        Assets: [
          'Cash',
          'Accounts Receivable',
          'Inventory',
          'Fixed Assets',
          'Prepaid Expenses',
        ],
        Liabilities: [
          'Accounts Payable',
          'Loan Payable',
          'Sales Tax Payable',
          'Accrued Liabilities',
          'Unearned Revenue',
          'Dividends Payable',
        ],
        Equity: ['Common Stock', 'Retained Earnings'],
      },
    };
    const balances: Record<string, number> = {};
    for (const section of Object.values(categories)) {
      for (const group of Object.values(section)) {
        for (const account of group) {
          balances[account] = 0;
        }
      }
    }
    fs.readdirSync(tmpDir).forEach((file) => {
      if (file.endsWith('.csv') && file !== 'fs.csv') {
        const lines = fs
          .readFileSync(path.join(tmpDir, file), 'utf-8')
          .trim()
          .split('\n');

        for (const line of lines) {
          const [, account, , debit, credit] = line.split(',');

          if (Object.prototype.hasOwnProperty.call(balances, account)) {
            balances[account] +=
              parseFloat(String(debit || 0)) - parseFloat(String(credit || 0));
          }
        }
      }
    });

    const output: string[] = [];
    output.push('Basic Financial Statement');
    output.push('');
    output.push('Income Statement');
    let totalRevenue = 0;
    let totalExpenses = 0;
    for (const account of categories['Income Statement']['Revenues']) {
      const value = balances[account] || 0;
      output.push(`${account},${value.toFixed(2)}`);
      totalRevenue += value;
    }
    for (const account of categories['Income Statement']['Expenses']) {
      const value = balances[account] || 0;
      output.push(`${account},${value.toFixed(2)}`);
      totalExpenses += value;
    }
    output.push(`Net Income,${(totalRevenue - totalExpenses).toFixed(2)}`);
    output.push('');
    output.push('Balance Sheet');
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    output.push('Assets');
    for (const account of categories['Balance Sheet']['Assets']) {
      const value = balances[account] || 0;
      output.push(`${account},${value.toFixed(2)}`);
      totalAssets += value;
    }
    output.push(`Total Assets,${totalAssets.toFixed(2)}`);
    output.push('');
    output.push('Liabilities');
    for (const account of categories['Balance Sheet']['Liabilities']) {
      const value = balances[account] || 0;
      output.push(`${account},${value.toFixed(2)}`);
      totalLiabilities += value;
    }
    output.push(`Total Liabilities,${totalLiabilities.toFixed(2)}`);
    output.push('');
    output.push('Equity');
    for (const account of categories['Balance Sheet']['Equity']) {
      const value = balances[account] || 0;
      output.push(`${account},${value.toFixed(2)}`);
      totalEquity += value;
    }
    output.push(
      `Retained Earnings (Net Income),${(totalRevenue - totalExpenses).toFixed(2)}`,
    );
    totalEquity += totalRevenue - totalExpenses;
    output.push(`Total Equity,${totalEquity.toFixed(2)}`);
    output.push('');
    output.push(
      `Assets = Liabilities + Equity, ${totalAssets.toFixed(2)} = ${(totalLiabilities + totalEquity).toFixed(2)}`,
    );
    fs.writeFileSync(outputFile, output.join('\n'));
  }
}
