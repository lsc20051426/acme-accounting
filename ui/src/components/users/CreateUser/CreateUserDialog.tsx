import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { UserRole } from '../../../../sdk/users';

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
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <FormControl
                  fullWidth
                  sx={{ mb: 2 }}
                  error={Boolean(fieldState.error)}
                >
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    label="Role"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    error={Boolean(fieldState.error)}
                  >
                    {roleOptions.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldState.error && (
                    <FormHelperText>{fieldState.error.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="name"
              rules={{
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters long',
                },
                maxLength: {
                  value: 40,
                  message: 'Name must be at most 40 characters long',
                },
                pattern: {
                  value: /^[a-zA-Z\s'-]+$/,
                  message:
                    'Name can only contain letters, spaces, apostrophes, and hyphens',
                },
              }}
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <TextField
                  fullWidth
                  id="user-name"
                  variant="outlined"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  label="Name"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState?.error?.message}
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
