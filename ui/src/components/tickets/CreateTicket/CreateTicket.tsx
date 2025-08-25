import { Alert, Button, Snackbar } from '@mui/material';
import { useState } from 'react';
import {
  CreateTicketDialog,
  type CreateTicketFormData,
} from './CreateTicketDialog';
import {
  useCreateTicketQuery,
  useInvalidateGetTicketsQuery,
} from '../../../queries/ticket.query';
import { useInvalidateGetUsersQuery } from '../../../queries/user.query';
import { useInvalidateGetCompaniesQuery } from '../../../queries/company.query';

export const CreateTicket = () => {
  const {
    mutateAsync: createTicket,
    isPending,
    isError,
  } = useCreateTicketQuery();
  const invalidateGetTickets = useInvalidateGetTicketsQuery();
  const invalidateGetUsers = useInvalidateGetUsersQuery();
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

  const handleSubmit = async (data: CreateTicketFormData) => {
    try {
      await createTicket({
        companyId: data.companyId,
        type: data.ticketType,
      });
      invalidateGetTickets();
      invalidateGetUsers();
      invalidateGetCompanies();
      setOpenSnackbar(true);
      setSnackbarMessage('Ticket created successfully!');
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
        Create Ticket
      </Button>

      {open && (
        <CreateTicketDialog
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
