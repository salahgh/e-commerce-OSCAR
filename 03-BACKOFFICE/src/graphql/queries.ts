import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      ... on CurrentUser {
        id
        identifier
        channels {
          id
          code
          permissions
        }
      }
      ... on InvalidCredentialsError {
        message
        errorCode
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      identifier
      channels {
        id
        code
        permissions
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts($options: ProductListOptions) {
    products(options: $options) {
      items {
        id
        name
        slug
        enabled
        featuredAsset {
          id
          preview
        }
        variants {
          id
          name
          sku
          price
          stockOnHand
        }
        customFields {
          nameFr
          nameAr
          isFeatured
          salePrice
        }
      }
      totalItems
    }
  }
`;

export const GET_ORDERS = gql`
  query GetOrders($options: OrderListOptions) {
    orders(options: $options) {
      items {
        id
        code
        state
        total
        totalWithTax
        createdAt
        customer {
          id
          firstName
          lastName
          emailAddress
        }
        customFields {
          wilaya
          trackingNumber
        }
      }
      totalItems
    }
  }
`;

export const GET_CUSTOMERS = gql`
  query GetCustomers($options: CustomerListOptions) {
    customers(options: $options) {
      items {
        id
        firstName
        lastName
        emailAddress
        phoneNumber
        createdAt
        customFields {
          wilaya
          city
        }
      }
      totalItems
    }
  }
`;

export const GET_COLLECTIONS = gql`
  query GetCollections($options: CollectionListOptions) {
    collections(options: $options) {
      items {
        id
        name
        slug
        featuredAsset {
          id
          preview
        }
        customFields {
          nameFr
          nameAr
          displayOrder
        }
      }
      totalItems
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    products {
      totalItems
    }
    orders {
      totalItems
    }
    customers {
      totalItems
    }
  }
`;
