import { Grid, Typography } from '@mui/material';
import { TicketList } from '../../components/tickets/TicketList/TicketList';
import { CreateTicket } from '../../components/tickets/CreateTicket/CreateTicket';
import { useGetTicketsQuery } from '../../queries/ticket.query';

export const TicketsPage = () => {
  const { data: tickets = [] } = useGetTicketsQuery();
  const isEmpty = tickets.length === 0;

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Tickets</Typography>
        {!isEmpty && <CreateTicket />}
      </Grid>
      <TicketList />
    </>
  );
};
