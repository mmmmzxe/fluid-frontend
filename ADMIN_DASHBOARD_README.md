# Admin Dashboard for E-commerce System

A comprehensive admin dashboard built with React, TypeScript, TailwindCSS, and shadcn/ui components, featuring role-based access control and full CRUD operations for e-commerce management.

## 🚀 Features

### Role-Based Access Control
- **Super Admin**: Full access to all modules
- **Admin**: Limited access to Orders Management and Support Management only

### Admin Modules

#### 1. Dashboard Overview
- Real-time statistics and metrics
- Quick action buttons
- Recent orders summary
- Revenue and user growth charts

#### 2. Category Management
- ✅ List all categories (GET /dashboard/category)
- ✅ Create category (POST /dashboard/category with FormData)
- ✅ Update category (PUT /dashboard/category/:id with FormData)
- ✅ Delete category (DELETE /dashboard/category/:id)
- Image upload support
- Bilingual support (English/Arabic)

#### 3. Product Management
- ✅ Create product (POST /product with FormData)
- ✅ Add variant to product (POST /product/:id)
- ✅ Edit variant (PATCH /product/:id/editVariant)
- ✅ List products with filters (GET /product?name=...&maxPrice=...)
- ✅ Get product by id (GET /product/:id)
- ✅ Update product (PATCH /product/:id)
- ✅ Delete product (DELETE /product/:id)
- Multiple image upload support
- Product variants management
- Stock management

#### 4. Orders Management
- ✅ Create order (POST /order)
- ✅ Create order without login (POST /order/without-login)
- ✅ Get user orders (GET /order/get-orders-by-user)
- ✅ Get all orders (GET /order/all-orders)
- ✅ Cancel public order (PATCH /order/:id/cancelWithoutLogin)
- ✅ Cancel order (PATCH /order/:id/cancel)
- ✅ Update status (PATCH /order/:id/status)
- Order status tracking
- Customer information display
- Order details modal

#### 5. User Management
- View all users
- Role-based user filtering
- User details and permissions
- Account management actions

#### 6. SubCategory Management
- ✅ Create (POST /subcategory/create)
- ✅ Update (PATCH /subcategory/update)
- ✅ Get all (GET /subcategory)
- ✅ Delete (DELETE /subcategory/:id)
- Parent category association
- Bilingual support

#### 7. Support Management
- ✅ Add support ticket (POST /support)
- ✅ Get all tickets (GET /support)
- Ticket status management
- Priority levels
- Customer communication

#### 8. Shipping Management
- ✅ Add shipping (POST /shipping)
- ✅ Update shipping (PATCH /shipping/:id)
- ✅ Get shipping (GET /shipping)
- ✅ Delete shipping (DELETE /shipping/:id)
- Shipping method configuration
- Price and delivery time management

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios with JWT authentication
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner toast system
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx          # Sidebar navigation
│   │   ├── AdminHeader.tsx          # Header with user menu
│   │   ├── AdminBreadcrumb.tsx      # Breadcrumb navigation
│   │   ├── DataTable.tsx            # Reusable data table component
│   │   ├── CategoryForm.tsx         # Category create/edit form
│   │   ├── ProductForm.tsx          # Product create/edit form
│   │   ├── OrderDetails.tsx         # Order details modal
│   │   ├── SupportTicketDetails.tsx # Support ticket details
│   │   ├── ShippingForm.tsx         # Shipping option form
│   │   ├── SubCategoryForm.tsx      # SubCategory form
│   │   └── UserDetails.tsx          # User details modal
│   └── ui/                          # shadcn/ui components
├── pages/
│   ├── admin/
│   │   ├── AdminOverview.tsx        # Dashboard overview
│   │   ├── CategoryManagement.tsx   # Category management page
│   │   ├── ProductManagement.tsx    # Product management page
│   │   ├── OrderManagement.tsx      # Order management page
│   │   ├── UserManagement.tsx       # User management page
│   │   ├── SubCategoryManagement.tsx # SubCategory management
│   │   ├── SupportManagement.tsx    # Support management
│   │   ├── ShippingManagement.tsx   # Shipping management
│   │   └── AdminProfile.tsx         # Admin profile page
│   └── AdminDashboard.tsx           # Main admin layout
├── services/
│   └── adminApi.ts                  # API service layer
└── store/
    └── slices/
        └── userSlice.ts             # User state management
```

## 🔐 Authentication & Authorization

### JWT Token Management
- Automatic token storage in localStorage
- Bearer token authentication for all API requests
- Automatic token refresh and logout on expiration

### Role-Based Access Control
```typescript
// User roles
type UserRole = 'superAdmin' | 'admin';

// Super Admin permissions
const superAdminModules = [
  'Dashboard', 'Categories', 'Products', 'Orders', 
  'Users', 'SubCategories', 'Support', 'Shipping'
];

// Admin permissions
const adminModules = [
  'Dashboard', 'Orders', 'Support'
];
```

## 🎨 UI Components

### DataTable Component
A reusable data table with:
- Search functionality
- Pagination
- Sorting
- Filtering
- Action buttons (Edit, Delete, View)
- Loading states
- Responsive design

### Form Components
- Form validation with Zod schemas
- File upload support
- Multi-step forms
- Real-time validation
- Error handling

## 📱 Responsive Design

- Mobile-first approach
- Collapsible sidebar for mobile
- Responsive data tables
- Touch-friendly interface
- Adaptive layouts

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access admin dashboard**:
   - Navigate to `/admin` after logging in
   - Ensure user has `superAdmin` or `admin` role

## 🔧 Configuration

### API Configuration
Update the API base URL in `src/services/adminApi.ts`:
```typescript
const API_BASE_URL = 'https://your-api-domain.com';
```

### Environment Variables
Create a `.env` file:
```env
VITE_API_BASE_URL=https://your-api-domain.com
```

## 📊 API Integration

All API endpoints are integrated with proper error handling:

```typescript
// Example API call
const response = await categoryApi.create(formData);
toast.success('Category created successfully');
```

### Error Handling
- Automatic error toast notifications
- Network error handling
- Validation error display
- Loading states management

## 🎯 Key Features

### 1. Real-time Updates
- Automatic data refresh after operations
- Optimistic UI updates
- Error rollback on failure

### 2. File Upload Support
- Image upload for categories and products
- Multiple file selection
- Preview functionality
- Progress indicators

### 3. Advanced Filtering
- Search across multiple fields
- Category-based filtering
- Status-based filtering
- Date range filtering

### 4. Bulk Operations
- Multi-select for bulk actions
- Batch processing
- Progress tracking

## 🔒 Security Features

- JWT token authentication
- Role-based route protection
- API request interception
- Automatic logout on token expiration
- Secure file upload handling

## 📈 Performance Optimizations

- Lazy loading of components
- Pagination for large datasets
- Debounced search
- Memoized components
- Optimized re-renders

## 🧪 Testing

The dashboard includes:
- Component testing setup
- API mocking capabilities
- User interaction testing
- Error scenario testing

## 🚀 Deployment

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Deploy to your hosting platform**:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using React, TypeScript, and TailwindCSS**


