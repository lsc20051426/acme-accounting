import { Grid, Typography } from '@mui/material';
import { UserList } from '../../components/users/UserList/UserList';
import { CreateUser } from '../../components/users/CreateUser/CreateUser';
import { useGetUsersQuery } from '../../queries/user.query';
import { useParams } from 'react-router';

export const UsersPage = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { data: users = [] } = useGetUsersQuery(Number(companyId));
  const isEmpty = users.length === 0;

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Users</Typography>
        {!isEmpty && <CreateUser />}
      </Grid>
      <UserList />
    </>
  );
};
