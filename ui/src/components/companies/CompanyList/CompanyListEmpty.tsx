import { Box, Typography } from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

import { CreateCompany } from '../CreateCompany/CreateCompany';

export function CompanyListEmpty() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      textAlign="center"
      gap={2}
      mt={24}
    >
      <BusinessCenterIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
      <Typography variant="h6" color="text.secondary">
        No companies found
      </Typography>
      <Typography variant="body2" color="text.secondary">
        It looks like there are no companies yet. You can create one to get
        started.
      </Typography>
      <CreateCompany />
    </Box>
  );
}
