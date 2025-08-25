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
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { UserRole } from '../../../sdk/users';

export interface CreateUserFormData {
  name: string;
  role: UserRole;
}

const roleOptions = [
  { value: UserRole.accountant, label: 'Accountant' },
  { value: UserRole.corporateSecretary, label: 'Corporate Secretary' },
];

export const CreateUserDialog = ({
  isLoading,
  onClose,
  onSubmit,
}: {
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateUserFormData) => void;
}) => {
  const { control, handleSubmit } = useForm<CreateUserFormData>();

  return (
    <>
      <Dialog open onClose={onClose}>
        <DialogTitle>Create User</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ minWidth: 512 }}>
            <Controller
              control={control}
              name="role"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    label="Role"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                  >
                    {roleOptions.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  fullWidth
                  id="user-name"
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
