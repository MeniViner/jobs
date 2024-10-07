import { styled } from '@mui/material/styles';
import { Button, ListItem } from '@mui/material';

export const Container = styled('div')(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}));

export const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    marginBottom: theme.spacing(4),
  },
}));

export const Avatar = styled('img')(({ theme }) => ({
  width: theme.spacing(10),
  height: theme.spacing(10),
  borderRadius: '50%',
  marginRight: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    width: theme.spacing(15),
    height: theme.spacing(15),
    marginRight: theme.spacing(3),
  },
}));

export const UserInfo = styled('div')({
  flexGrow: 1,
});

export const Content = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    gap: theme.spacing(4),
  },
}));

export const Menu = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: '250px',
  },
}));

export const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

export const SectionContent = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    flexGrow: 1,
  },
}));

export const EditButton = styled(Button)(({ theme }) => ({
  '&.active': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

export const FullWidthButton = styled(Button)({
  marginTop: '16px',
});
