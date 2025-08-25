import { Alert, Button, Snackbar } from '@mui/material';
import { useState } from 'react';
import { CreateUserDialog, type CreateUserFormData } from './CreateUserDialog';
import {
  useCreateUserQuery,
  useInvalidateGetUsersQuery,
} from '../../../queries/user.query';
import { useParams } from 'react-router';

export const CreateUser = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { mutateAsync: createUser, isPending, isError } = useCreateUserQuery();
  const invalidateGetUsers = useInvalidateGetUsersQuery();
  const [open, setOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const handleSubmit = async (data: CreateUserFormData) => {
    try {
      await createUser({
        name: data.name,
        companyId: Number(companyId),
        role: data.role,
      });
      invalidateGetUsers();
      setOpenSnackbar(true);
      setSnackbarMessage('User created successfully!');
    } catch (error: Error) {
      setOpenSnackbar(true);
      setSnackbarMessage(error.message);
    }

    closeDialog();
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={openDialog}>
        Create User
      </Button>

      {open && (
        <CreateUserDialog
          isLoading={isPending}
          onClose={closeDialog}
          onSubmit={handleSubmit}
        />
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={isError ? 'error' : 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
