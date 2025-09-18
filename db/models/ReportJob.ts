import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

export enum ReportJobStatus {
  pending = 'pending',
  processing = 'processing',
  completed = 'completed',
  failed = 'failed',
}

export enum ReportType {
  accounts = 'accounts',
  yearly = 'yearly',
  fs = 'fs',
}

@Table({
  tableName: 'report_jobs',
  timestamps: true,
})
export class ReportJob extends Model<ReportJob> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.ENUM(...Object.values(ReportType)),
    field: 'report_type',
  })
  declare reportType: ReportType;

  @Column({
    type: DataType.ENUM(...Object.values(ReportJobStatus)),
    defaultValue: ReportJobStatus.pending,
  })
  declare status: ReportJobStatus;

  @Column({
    type: DataType.DATE,
    field: 'started_at',
  })
  declare startedAt: Date;

  @Column({
    type: DataType.DATE,
    field: 'completed_at',
  })
  declare completedAt: Date;

  @Column({
    type: DataType.TEXT,
  })
  declare error: string;

  @Column({
    type: DataType.INTEGER,
    field: 'processing_time_ms',
    comment: 'Processing time in milliseconds',
  })
  declare processingTimeMs: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  declare updatedAt: Date;
}
