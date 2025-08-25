import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { useNavigate } from 'react-router';

const navigation = [
  {
    label: 'Tickets',
    icon: <InboxIcon />,
    link: '/',
  },
  {
    label: 'Companies',
    icon: <BusinessCenterIcon />,
    link: '/companies',
  },
];
const drawerWidth = 240;
export const Navigation = () => {
  const navigate = useNavigate();
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <List>
        {navigation.map(({ label, icon, link }) => (
          <ListItem key={label} disablePadding>
            <ListItemButton onClick={() => navigate(link)}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
