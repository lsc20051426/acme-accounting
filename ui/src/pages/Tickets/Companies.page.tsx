import { Grid, Typography } from '@mui/material';
import { CreateCompany } from '../../components/companies/CreateCompany/CreateCompany';
import { CompanyList } from '../../components/companies/CompanyList/CompanyList';
import { useGetCompaniesQuery } from '../../queries/company.query';

export const CompaniesPage = () => {
  const { data: companies = [] } = useGetCompaniesQuery();
  const isEmpty = companies.length === 0;

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Companies</Typography>
        {!isEmpty && <CreateCompany />}
      </Grid>
      <CompanyList />
    </>
  );
};
