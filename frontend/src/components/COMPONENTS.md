# Reusable Components

## Components List

### 1. **Footer**
A complete footer component with links, social media icons, and contact information.

```jsx
import { Footer } from './components';

<Footer />
```

### 2. **LoadingSpinner**
Loading indicator with customizable size and optional full-screen overlay.

```jsx
import { LoadingSpinner } from './components';

<LoadingSpinner size="md" message="Loading..." />
<LoadingSpinner size="lg" fullScreen={true} />
```

**Props:**
- `size`: "sm" | "md" | "lg" | "xl" (default: "md")
- `fullScreen`: boolean (default: false)
- `message`: string (default: "Loading...")

### 3. **Modal**
Reusable modal dialog with customizable size and content.

```jsx
import { Modal } from './components';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  <p>Modal content goes here</p>
</Modal>
```

**Props:**
- `isOpen`: boolean (required)
- `onClose`: function (required)
- `title`: string (required)
- `size`: "sm" | "md" | "lg" | "xl" (default: "md")
- `children`: ReactNode (required)

### 4. **Badge**
Status badges with different variants and sizes.

```jsx
import { Badge } from './components';

<Badge variant="success" size="md">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger" size="sm">Cancelled</Badge>
```

**Props:**
- `variant`: "default" | "primary" | "success" | "warning" | "danger" | "info" | "orange" | "purple"
- `size`: "sm" | "md" | "lg" (default: "md")
- `children`: ReactNode (required)

### 5. **EmptyState**
Display empty states with icon, title, description, and optional action button.

```jsx
import { EmptyState } from './components';

<EmptyState
  icon="📭"
  title="No items found"
  description="Try adjusting your filters"
  action={<button>Add Item</button>}
/>
```

**Props:**
- `icon`: string | ReactNode (default: "📭")
- `title`: string (default: "Nothing here")
- `description`: string
- `action`: ReactNode

### 6. **FoodCard**
Enhanced food item card with quantity selector, favorites, badges, and animations.

```jsx
import { FoodCard } from './components';

<FoodCard
  food={foodItem}
  onAddToCart={(foodId, quantity) => handleAddToCart(foodId, quantity)}
  onToggleFavorite={(foodId) => handleFavorite(foodId)}
  isFavorite={false}
/>
```

**Props:**
- `food`: object (required) - Food item with _id, title, price, category, rating, etc.
- `onAddToCart`: function(foodId, quantity)
- `onToggleFavorite`: function(foodId)
- `isFavorite`: boolean (default: false)

### 7. **SearchBar**
Search input with clear button.

```jsx
import { SearchBar } from './components';

<SearchBar
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Search foods..."
  onClear={() => console.log('Cleared')}
/>
```

**Props:**
- `value`: string (required)
- `onChange`: function (required)
- `placeholder`: string (default: "Search...")
- `onClear`: function

### 8. **Pagination**
Page navigation component with first/last page buttons.

```jsx
import { Pagination } from './components';

<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={(newPage) => setPage(newPage)}
/>
```

**Props:**
- `currentPage`: number (required)
- `totalPages`: number (required)
- `onPageChange`: function(pageNumber) (required)

### 9. **ReviewCard**
Display user reviews with stars, edit/delete actions.

```jsx
import { ReviewCard } from './components';

<ReviewCard
  review={reviewData}
  onEdit={(review) => handleEdit(review)}
  onDelete={(reviewId) => handleDelete(reviewId)}
  showActions={true}
/>
```

**Props:**
- `review`: object (required) - Review with rating, comment, userId, createdAt
- `onEdit`: function(review)
- `onDelete`: function(reviewId)
- `showActions`: boolean (default: false)

## Usage Examples

### Import all components:
```jsx
import {
  Footer,
  LoadingSpinner,
  Modal,
  Badge,
  EmptyState,
  FoodCard,
  SearchBar,
  Pagination,
  ReviewCard
} from './components';
```

### Or import individually:
```jsx
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
```
