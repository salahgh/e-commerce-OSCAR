import { useQuery } from '@apollo/client';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { GET_DASHBOARD_STATS } from '../graphql/queries';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data, loading, error } = useQuery(GET_DASHBOARD_STATS);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">Error loading dashboard: {error.message}</Typography>
      </Box>
    );
  }

  const stats = [
    {
      title: 'Total Products',
      value: data?.products?.totalItems || 0,
      icon: <InventoryIcon sx={{ color: 'white', fontSize: 32 }} />,
      color: '#1976d2',
    },
    {
      title: 'Total Orders',
      value: data?.orders?.totalItems || 0,
      icon: <ShoppingCartIcon sx={{ color: 'white', fontSize: 32 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Total Customers',
      value: data?.customers?.totalItems || 0,
      icon: <PeopleIcon sx={{ color: 'white', fontSize: 32 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Revenue',
      value: '0 DZD',
      icon: <TrendingUpIcon sx={{ color: 'white', fontSize: 32 }} />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Welcome to OSCAR Fashion Admin Panel
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Use the sidebar menu to navigate to Products, Orders, Customers, and Collections.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
