import { Box, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { CreateUser } from '../CreateUser/CreateUser';

export function UserListEmpty() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      textAlign="center"
      gap={2}
      mt={24}
    >
      <PeopleIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
      <Typography variant="h6" color="text.secondary">
        No users found
      </Typography>
      <Typography variant="body2" color="text.secondary">
        It looks like there are no users yet. You can create one to get started.
      </Typography>
      <CreateUser />
    </Box>
  );
}
