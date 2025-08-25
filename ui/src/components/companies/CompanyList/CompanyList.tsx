import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useNavigate } from 'react-router';
import { CompanyListEmpty } from './CompanyListEmpty';
import { useGetCompaniesQuery } from '../../../queries/company.query';

export const CompanyList = () => {
  const navigate = useNavigate();
  const { data: companies = [], isLoading } = useGetCompaniesQuery();
  const isEmpty = companies.length === 0;

  const handleRowClick = (id: number) => () => {
    navigate(`/companies/${id}/users`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      {isEmpty ? (
        <CompanyListEmpty />
      ) : (
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell width={100}>ID</TableCell>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map((row) => (
              <TableRow
                key={row.id}
                hover
                onClick={handleRowClick(row.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};
