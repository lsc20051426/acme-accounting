import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, getUsers, type newUserDto } from '../../sdk/users';

const queryKey = ['users'];

export const useCreateUserQuery = () => {
  return useMutation({
    mutationFn: (data: newUserDto) => createUser(data),
  });
};

export const useGetUsersQuery = (companyId?: number) => {
  return useQuery({
    queryKey: [...queryKey, companyId],
    queryFn: () => getUsers(companyId),
  });
};

export const useInvalidateGetUsersQuery = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey });
};
