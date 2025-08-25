import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTicket, getTickets, type newTicketDto } from '../sdk/tickets';

const queryKey = ['tickets'];

export const useCreateTicketQuery = () => {
  return useMutation({
    mutationFn: (data: newTicketDto) => createTicket(data),
  });
};

export const useGetTicketsQuery = () => {
  return useQuery({
    queryKey,
    queryFn: getTickets,
  });
};

export const useInvalidateGetTicketsQuery = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey });
};
