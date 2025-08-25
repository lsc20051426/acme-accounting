import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCompany,
  getCompanies,
  type newCompanyDto,
} from '../../sdk/companies';

const queryKey = ['companies'];

export const useCreateCompanyQuery = () => {
  return useMutation({
    mutationFn: (data: newCompanyDto) => createCompany(data),
  });
};

export const useGetCompaniesQuery = () => {
  return useQuery({
    queryKey,
    queryFn: getCompanies,
  });
};

export const useInvalidateGetCompaniesQuery = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey });
};
