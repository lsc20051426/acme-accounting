import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import { CreateTicket } from '../CreateTicket/CreateTicket';

export function TicketListEmpty() {
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
      <InboxIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
      <Typography variant="h6" color="text.secondary">
        No tickets found
      </Typography>
      <Typography variant="body2" color="text.secondary">
        It looks like there are no tickets yet. You can create one to get
        started.
      </Typography>
      <CreateTicket />
    </Box>
  );
}
