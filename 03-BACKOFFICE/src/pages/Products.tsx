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
  Avatar,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { GET_PRODUCTS } from '../graphql/queries';

interface Product {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  featuredAsset?: {
    id: string;
    preview: string;
  };
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    stockOnHand: number;
  }>;
  customFields?: {
    nameFr?: string;
    nameAr?: string;
    isFeatured?: boolean;
    salePrice?: number;
  };
}

export default function Products() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: {
      options: {
        take: rowsPerPage,
        skip: page * rowsPerPage,
        filter: searchTerm
          ? {
              name: {
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
        <Typography color="error">Error loading products: {error.message}</Typography>
      </Box>
    );
  }

  const products: Product[] = data?.products?.items || [];
  const totalItems = data?.products?.totalItems || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Products
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} color="primary">
          Add Product
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search products..."
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
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={product.featuredAsset?.preview}
                      sx={{ width: 48, height: 48 }}
                    >
                      {product.name.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {product.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {product.variants[0]?.sku || '-'}
                  </TableCell>
                  <TableCell>
                    {product.variants[0] ? formatPrice(product.variants[0].price) : '-'}
                  </TableCell>
                  <TableCell>
                    {product.variants.reduce((sum, v) => sum + v.stockOnHand, 0)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.enabled ? 'Active' : 'Disabled'}
                      color={product.enabled ? 'success' : 'default'}
                      size="small"
                    />
                    {product.customFields?.isFeatured && (
                      <Chip
                        label="Featured"
                        color="primary"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="textSecondary" sx={{ py: 4 }}>
                      No products found
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
