import { TicketCategory, TicketType } from '../../../sdk/tickets';
import {
  Avatar,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { TicketListEmpty } from './TicketListEmpty';
import { useGetTicketsQuery } from '../../../queries/ticket.query';
import { useGetCompaniesQuery } from '../../../queries/company.query';
import type { CompanyDto } from '../../../sdk/companies';
import { useGetUsersQuery } from '../../../queries/user.query';
import type { UserDto } from '../../../sdk/users';

export const TicketList = () => {
  const { data: tickets = [], isLoading } = useGetTicketsQuery();
  const { data: companies = [] } = useGetCompaniesQuery();
  const { data: users = [] } = useGetUsersQuery();
  const isEmpty = tickets.length === 0;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      {isEmpty ? (
        <TicketListEmpty />
      ) : (
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell width={100}>ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>
                  <Chip label={row.status} />
                </TableCell>
                <TableCell>
                  <Box component="span" display="flex" alignItems="center">
                    <Avatar
                      sx={{ width: 24, height: 24, mr: 1 }}
                      alt={getUserName(row.assigneeId, users)}
                    />
                    {getUserName(row.assigneeId, users)}
                  </Box>
                </TableCell>
                <TableCell>
                  {getCompanyName(row.companyId, companies)}
                </TableCell>
                <TableCell>{getCategoryName(row.category)}</TableCell>
                <TableCell align="right">{getTypeName(row.type)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

function getCompanyName(companyId: number, companies: CompanyDto[]) {
  const company = companies.find((c) => c.id === companyId);
  return company ? company.name : 'Unknown';
}

function getUserName(userId: number, users: UserDto[]) {
  const user = users.find((u) => u.id === userId);
  return user ? user.name : 'Unknown';
}

function getTypeName(type: TicketType) {
  const typeNames: Record<TicketType, string> = {
    [TicketType.managementReport]: 'Management Report',
    [TicketType.registrationAddressChange]: 'Registration Address Change',
  };

  return typeNames[type] || 'Unknown';
}

function getCategoryName(category: TicketCategory) {
  const categoryNames: Record<string, string> = {
    [TicketCategory.accounting]: 'Accounting',
    [TicketCategory.corporate]: 'Corporate',
    [TicketCategory.management]: 'Management',
  };

  return categoryNames[category] || 'Unknown';
}
