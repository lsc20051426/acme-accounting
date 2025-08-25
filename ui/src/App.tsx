import { BrowserRouter, Route, Routes } from 'react-router';
import './App.css';
import { Navigation } from './components/Navigation/Navigation';
import { TicketsPage } from './pages/Tickets/Tickets.page';
import { Box } from '@mui/material';
import { CompaniesPage } from './pages/Tickets/Companies.page';
import { UsersPage } from './pages/Tickets/Users.page';

function App() {
  return (
    <BrowserRouter>
      <Box
        sx={{
          display: 'flex',
          flex: '1',
        }}
      >
        <Navigation />
        <Box
          sx={{
            flex: '1',
          }}
        >
          <Routes>
            <Route path="/" element={<TicketsPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:companyId/users" element={<UsersPage />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;
