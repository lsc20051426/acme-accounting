import { Alert, Button, Snackbar } from '@mui/material';
import { useState } from 'react';
import {
  CreateCompanyDialog,
  type CreateCompanyFormData,
} from './CreateCompanyDialog';
import {
  useCreateCompanyQuery,
  useInvalidateGetCompaniesQuery,
} from '../../../queries/company.query';

export const CreateCompany = () => {
  const {
    mutateAsync: createCompany,
    isPending,
    isError,
  } = useCreateCompanyQuery();
  const invalidateGetCompanies = useInvalidateGetCompaniesQuery();
  const [open, setOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const handleSubmit = async (data: CreateCompanyFormData) => {
    try {
      await createCompany({
        name: data.name,
      });
      invalidateGetCompanies();
      setOpenSnackbar(true);
      setSnackbarMessage('Company created successfully!');
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
        Create Company
      </Button>

      {open && (
        <CreateCompanyDialog
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
