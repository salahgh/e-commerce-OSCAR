import { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { GET_ORDERS } from '../graphql/queries';

interface Order {
  id: string;
  code: string;
  state: string;
  total: number;
  totalWithTax: number;
  createdAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
  };
  customFields?: {
    wilaya?: string;
    trackingNumber?: string;
  };
}

const orderStateColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  AddingItems: 'default',
  ArrangingPayment: 'warning',
  PaymentAuthorized: 'info',
  PaymentSettled: 'success',
  PartiallyShipped: 'info',
  Shipped: 'primary',
  PartiallyDelivered: 'info',
  Delivered: 'success',
  Modifying: 'warning',
  ArrangingAdditionalPayment: 'warning',
  Cancelled: 'error',
};

export default function Orders() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, error } = useQuery(GET_ORDERS, {
    variables: {
      options: {
        take: rowsPerPage,
        skip: page * rowsPerPage,
        sort: {
          createdAt: 'DESC',
        },
        filter: searchTerm
          ? {
              code: {
                contains: searchTerm,
              },
            }
          : undefined,
      },
    },
  });

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatPrice = (price: number) => {
    return `${(price / 100).toFixed(2)} DZD`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">Error loading orders: {error.message}</Typography>
      </Box>
    );
  }

  const orders: Order[] = data?.orders?.items || [];
  const totalItems = data?.orders?.totalItems || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Orders
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by order code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="small"
          />
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Code</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Wilaya</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tracking</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {order.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.customer ? (
                      <>
                        <Typography variant="body2">
                          {order.customer.firstName} {order.customer.lastName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {order.customer.emailAddress}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Guest
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.customFields?.wilaya || '-'}
                  </TableCell>
                  <TableCell>
                    {formatPrice(order.totalWithTax)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.state}
                      color={orderStateColors[order.state] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {order.customFields?.trackingNumber || '-'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary" sx={{ py: 4 }}>
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>
    </Box>
  );
}
