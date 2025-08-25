import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useParams } from 'react-router';
import { UserListEmpty } from './UserListEmpty';
import { useGetUsersQuery } from '../../../queries/user.query';

export const UserList = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { data: users = [], isLoading } = useGetUsersQuery(Number(companyId));
  const isEmpty = users.length === 0;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      {isEmpty ? (
        <UserListEmpty />
      ) : (
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell width={100}>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};
