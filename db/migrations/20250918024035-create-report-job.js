'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('report_jobs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      reportType: {
        type: Sequelize.ENUM('accounts', 'yearly', 'fs'),
        allowNull: false,
        field: 'report_type',
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      startedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'started_at',
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'completed_at',
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      processingTimeMs: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'processing_time_ms',
        comment: 'Processing time in milliseconds',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at',
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at',
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('report_jobs');
  }
};
