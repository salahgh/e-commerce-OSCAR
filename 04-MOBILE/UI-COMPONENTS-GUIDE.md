# UI Components Library - OSCAR Fashion Mobile

Complete guide to all base UI components created for the OSCAR Fashion mobile app.

---

## 📦 Components Overview

### Base Components
1. **Button** - Primary action component
2. **Input** - Text input with validation
3. **Card** - Container component

### Loading States
4. **LoadingSpinner** - Activity indicator
5. **LoadingOverlay** - Full-screen loader
6. **Skeleton** - Content placeholder
7. **SkeletonText** - Text placeholder
8. **SkeletonCard** - Card placeholder
9. **SkeletonProductCard** - Product card placeholder

### State Components
10. **EmptyState** - Empty state UI
11. **ErrorState** - Error screen
12. **ErrorBanner** - Inline error banner
13. **InlineError** - Small error message

### Additional Components
14. **Badge** - Label/tag component
15. **NotificationBadge** - Count indicator
16. **Divider** - Visual separator
17. **Avatar** - User avatar
18. **Chip** - Selectable filter chip

---

## 🎨 Component Usage

### 1. Button

**Variants:** `primary`, `secondary`, `outline`, `ghost`, `danger`
**Sizes:** `small`, `medium`, `large`

```tsx
import { Button } from '@/components/ui';

// Primary button
<Button
  title="Add to Cart"
  onPress={handleAddToCart}
  variant="primary"
  size="medium"
/>

// Loading state
<Button
  title="Processing..."
  onPress={handleSubmit}
  loading={true}
/>

// Disabled
<Button
  title="Unavailable"
  onPress={() => {}}
  disabled={true}
/>

// Full width
<Button
  title="Checkout"
  onPress={handleCheckout}
  fullWidth={true}
/>
```

**Props:**
- `title` (string, required)
- `onPress` (() => void, required)
- `variant?` (ButtonVariant)
- `size?` (ButtonSize)
- `loading?` (boolean)
- `disabled?` (boolean)
- `fullWidth?` (boolean)
- `icon?` (ReactNode)
- `iconPosition?` ('left' | 'right')

---

### 2. Input

**Features:**
- Label support
- Error messages
- Helper text
- Left/right icons
- Required field indicator

```tsx
import { Input } from '@/components/ui';

// Basic input
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
/>

// With validation error
<Input
  label="Password"
  placeholder="Enter password"
  value={password}
  onChangeText={setPassword}
  error={errors.password}
  secureTextEntry={true}
/>

// With icons
<Input
  label="Search"
  placeholder="Search products..."
  value={search}
  onChangeText={setSearch}
  leftIcon={<SearchIcon />}
  rightIcon={<ClearIcon />}
  onRightIconPress={clearSearch}
/>

// Required field
<Input
  label="Full Name"
  placeholder="John Doe"
  value={name}
  onChangeText={setName}
  required={true}
/>
```

**Props:**
- All TextInput props
- `label?` (string)
- `error?` (string)
- `helperText?` (string)
- `leftIcon?` (ReactNode)
- `rightIcon?` (ReactNode)
- `onRightIconPress?` (() => void)
- `required?` (boolean)

---

### 3. Card

**Variants:** `elevated`, `outlined`, `flat`

```tsx
import { Card, ProductCard, InfoCard } from '@/components/ui';

// Elevated card (default)
<Card variant="elevated" padding="lg">
  <Text>Card content</Text>
</Card>

// Pressable card
<Card
  pressable={true}
  onPress={handlePress}
>
  <Text>Tap me</Text>
</Card>

// Pre-configured variants
<ProductCard>
  {/* Product content */}
</ProductCard>

<InfoCard>
  {/* Info content */}
</InfoCard>
```

**Props:**
- `children` (ReactNode, required)
- `variant?` ('elevated' | 'outlined' | 'flat')
- `padding?` (spacing key or number)
- `onPress?` (() => void)
- `pressable?` (boolean)

---

### 4. Loading Components

```tsx
import {
  LoadingSpinner,
  LoadingOverlay,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonProductCard
} from '@/components/ui';

// Spinner
<LoadingSpinner size="large" />

// Full-screen overlay
<LoadingOverlay visible={isLoading} />

// Content placeholders
<Skeleton width={200} height={20} />
<SkeletonText lines={3} />
<SkeletonCard />
<SkeletonProductCard />
```

**Usage Example - Product List Loading:**
```tsx
{loading ? (
  <View style={styles.grid}>
    <SkeletonProductCard />
    <SkeletonProductCard />
    <SkeletonProductCard />
    <SkeletonProductCard />
  </View>
) : (
  <FlatList data={products} renderItem={renderProduct} />
)}
```

---

### 5. Empty State

```tsx
import { EmptyState } from '@/components/ui';

<EmptyState
  icon={<EmptyCartIcon />}
  title="Your cart is empty"
  description="Add some products to get started"
  actionLabel="Browse Products"
  onActionPress={() => navigation.navigate('Products')}
/>
```

**Props:**
- `title` (string, required)
- `description?` (string)
- `icon?` (ReactNode)
- `actionLabel?` (string)
- `onActionPress?` (() => void)

---

### 6. Error Components

```tsx
import { ErrorState, ErrorBanner, InlineError } from '@/components/ui';

// Full-page error
<ErrorState
  title="Something went wrong"
  message={error.message}
  onRetry={refetch}
  retryLabel="Try Again"
/>

// Error banner
<ErrorBanner
  message="Failed to load products"
  onDismiss={() => setError(null)}
/>

// Inline error (for forms)
<InlineError message="Invalid email address" />
```

---

### 7. Badge

```tsx
import { Badge, NotificationBadge } from '@/components/ui';

// Status badge
<Badge
  label="New"
  variant="success"
  size="small"
/>

// Discount badge
<Badge
  label="-30%"
  variant="error"
  size="medium"
/>

// Notification badge (on icon)
<View>
  <CartIcon />
  <NotificationBadge count={5} />
</View>
```

**Variants:** `primary`, `secondary`, `success`, `error`, `warning`, `info`

---

### 8. Divider

```tsx
import { Divider } from '@/components/ui';

// Horizontal divider
<Divider />

// With label
<Divider label="OR" />

// Vertical divider
<View style={{ flexDirection: 'row' }}>
  <Text>Left</Text>
  <Divider orientation="vertical" />
  <Text>Right</Text>
</View>

// Custom spacing
<Divider spacing="xl" />
```

---

### 9. Avatar

```tsx
import { Avatar } from '@/components/ui';

// With image
<Avatar
  source={{ uri: user.avatarUrl }}
  size="large"
/>

// With initials
<Avatar
  name="John Doe"
  size="medium"
/>

// Sizes: small (32), medium (48), large (64), xlarge (96)
```

---

### 10. Chip

```tsx
import { Chip } from '@/components/ui';

// Filter chip
<Chip
  label="Size M"
  selected={selectedSize === 'M'}
  onPress={() => setSelectedSize('M')}
/>

// Outlined variant
<Chip
  label="Color Red"
  selected={selectedColor === 'red'}
  onPress={() => setSelectedColor('red')}
  variant="outlined"
/>
```

---

## 🎯 Common Patterns

### Form with Validation

```tsx
import { Input, Button, InlineError } from '@/components/ui';
import { Formik } from 'formik';
import * as Yup from 'yup';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too short').required('Required'),
});

<Formik
  initialValues={{ email: '', password: '' }}
  validationSchema={loginSchema}
  onSubmit={handleLogin}
>
  {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
    <>
      <Input
        label="Email"
        value={values.email}
        onChangeText={handleChange('email')}
        onBlur={handleBlur('email')}
        error={touched.email && errors.email ? errors.email : undefined}
        keyboardType="email-address"
      />

      <Input
        label="Password"
        value={values.password}
        onChangeText={handleChange('password')}
        onBlur={handleBlur('password')}
        error={touched.password && errors.password ? errors.password : undefined}
        secureTextEntry
      />

      <Button
        title="Login"
        onPress={handleSubmit}
        fullWidth
      />
    </>
  )}
</Formik>
```

---

### Product Card

```tsx
import { Card, Badge, Button } from '@/components/ui';

<ProductCard pressable onPress={() => navigate('ProductDetail', { id })}>
  <Image source={{ uri: product.imageUrl }} style={styles.image} />

  {product.salePrice && (
    <Badge
      label={`-${discount}%`}
      variant="error"
      style={styles.badge}
    />
  )}

  <Text style={styles.name}>{product.name}</Text>
  <Text style={styles.price}>{product.price} DZD</Text>

  <Button
    title="Add to Cart"
    onPress={handleAddToCart}
    size="small"
    variant="primary"
  />
</ProductCard>
```

---

### Loading States

```tsx
import { LoadingSpinner, SkeletonProductCard } from '@/components/ui';

const ProductList = () => {
  const { data, loading, error } = useQuery(GET_PRODUCTS);

  if (loading) {
    return (
      <View style={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonProductCard key={i} />
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  if (data.products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        actionLabel="Browse All"
        onActionPress={() => navigation.goBack()}
      />
    );
  }

  return <FlatList data={data.products} renderItem={renderProduct} />;
};
```

---

## 📁 File Structure

```
src/components/ui/
├── Button.tsx          # Button component
├── Input.tsx           # Input component
├── Card.tsx            # Card component
├── Loading.tsx         # All loading components
├── EmptyState.tsx      # Empty state
├── ErrorState.tsx      # Error components
├── Badge.tsx           # Badge components
├── Divider.tsx         # Divider component
├── Avatar.tsx          # Avatar component
├── Chip.tsx            # Chip component
└── index.ts            # Barrel export
```

---

## 🎨 Design System Integration

All components use the centralized theme:

```tsx
import { colors, spacing, typography } from '@/theme';

// Colors
colors.primary        // #2C3E50
colors.secondary      // #E8D5C4
colors.accent         // #C9A992

// Spacing
spacing.sm           // 8
spacing.md           // 12
spacing.lg           // 16

// Typography
typography.fontSize.md    // 16
typography.fontWeight.semiBold  // '600'
```

---

## ✅ Best Practices

1. **Always use theme values** instead of hardcoded colors/spacing
2. **Provide meaningful labels** for accessibility
3. **Handle loading and error states** consistently
4. **Use TypeScript** for type safety
5. **Test on both iOS and Android** for consistency
6. **Support RTL** for Arabic language

---

## 🚀 Next Steps

With these base components ready, you can now build:

1. **Authentication screens** (Login, Register)
2. **Product screens** (List, Detail)
3. **Cart & Checkout** screens
4. **Profile** screens

All using these consistent, reusable components!

---

**Version:** 1.0
**Last Updated:** $(date)
**Status:** ✅ Complete
