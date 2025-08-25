import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { TicketType } from '../../../../sdk/tickets';
import { useGetCompaniesQuery } from '../../../queries/company.query';

const ticketTypeOptions = [
  {
    label: 'Management report',
    value: TicketType.managementReport,
  },
  {
    label: 'Registration address change',
    value: TicketType.registrationAddressChange,
  },
];

export interface CreateTicketFormData {
  companyId: number;
  ticketType: TicketType;
}

export const CreateTicketDialog = ({
  isLoading,
  onClose,
  onSubmit,
}: {
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateTicketFormData) => void;
}) => {
  const { data: companies = [] } = useGetCompaniesQuery();
  const { control, handleSubmit } = useForm<CreateTicketFormData>();

  return (
    <>
      <Dialog open onClose={onClose}>
        <DialogTitle>Create Ticket</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ minWidth: 512 }}>
            <Controller
              control={control}
              name="companyId"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="company-id-label">Company</InputLabel>
                  <Select
                    labelId="company-id-label"
                    label="Company"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                  >
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="ticketType"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl fullWidth>
                  <InputLabel id="ticket-type-label">Type</InputLabel>
                  <Select
                    labelId="ticket-type-label"
                    label="Type"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                  >
                    {ticketTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              color="primary"
              disabled={isLoading}
              loading={isLoading}
            >
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};
