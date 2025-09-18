'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 3 sample companies
    const companies = await queryInterface.bulkInsert(
      'companies',
      [
        {
          name: 'ACME Technologies',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'ACME Global',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'ACME Limited',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      { returning: true }
    );

    // Add users with different roles
    const users = await queryInterface.bulkInsert(
      'users',
      [
        {
          name: 'Acme Director',
          role: 'director',
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Acme Accountant',
          role: 'accountant',
          companyId: 1, 
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Acme Admin',
          role: 'corporateSecretary',
          companyId: 1, 
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Acme Global Director',
          role: 'director',
          companyId: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Acme Limited Director',
          role: 'director',
          companyId: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      { returning: true }
    );

    // Add various tickets
    return queryInterface.bulkInsert(
      'tickets',
      [
        {
          type: 'managementReport',
          status: 'open',
          category: 'accounting',
          companyId: 1,
          assigneeId: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: 'registrationAddressChange',
          status: 'open',
          category: 'registrationAddressChange',
          companyId: 2,
          assigneeId: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: 'managementReport',
          status: 'resolved',
          category: 'accounting',
          companyId: 3,
          assigneeId: 5,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: 'managementReport',
          status: 'open',
          category: 'accounting',
          companyId: 1,
          assigneeId: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: 'registrationAddressChange',
          status: 'resolved',
          category: 'registrationAddressChange',
          companyId: 3,
          assigneeId: 5,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tickets', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('companies', null, {});
  }
};