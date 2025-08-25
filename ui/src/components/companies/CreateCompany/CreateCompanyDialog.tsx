import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

export interface CreateCompanyFormData {
  name: string;
}

export const CreateCompanyDialog = ({
  isLoading,
  onClose,
  onSubmit,
}: {
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateCompanyFormData) => void;
}) => {
  const { control, handleSubmit } = useForm<CreateCompanyFormData>();

  return (
    <>
      <Dialog open onClose={onClose}>
        <DialogTitle>Create Company</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ minWidth: 512 }}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  fullWidth
                  id="company-name"
                  variant="outlined"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  label="Name"
                />
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
