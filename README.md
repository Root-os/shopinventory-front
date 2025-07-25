# Sales Management System

A comprehensive sales management application built with Next.js 15, React 19, and TypeScript.

## Features

- 🔐 **Authentication & Authorization** - JWT-based authentication with role management
- 📊 **Dashboard** - Comprehensive overview with statistics and analytics
- 🏷️ **Category Management** - Create, edit, and delete product categories
- 📦 **Inventory Management** - Track items, stock levels, and low stock alerts
- 👥 **User Management** - Manage system users with different roles
- 🤝 **Customer Management** - Handle customer information and relationships
- 🛒 **Order Management** - Complete order processing with payment tracking
- 🔍 **Search & Filtering** - Advanced search and filtering across all modules
- 🎨 **Theme Support** - Light/Dark mode with system preference detection
- 📱 **Responsive Design** - Works seamlessly on all device sizes

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **Icons**: Lucide React
- **Authentication**: JWT tokens with localStorage persistence

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository or download the project files

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

3. Set up environment variables:
Create a `.env.local` file in the root directory:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3000
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── layout/           # Layout components
│   ├── orders/           # Order management components
│   ├── tabs/             # Tab components for different sections
│   └── ui/               # shadcn/ui components
├── contexts/             # React contexts
│   ├── AuthContext.tsx   # Authentication context
│   └── ThemeContext.tsx  # Theme context
├── hooks/                # Custom React hooks
│   ├── use-mobile.ts     # Mobile detection hook
│   ├── use-search.ts     # Search functionality hook
│   └── use-toast.ts      # Toast notifications hook
├── lib/                  # Utility libraries
│   └── utils.ts          # Utility functions
├── services/             # API service layers
│   ├── api.ts            # Base API service
│   ├── authService.ts    # Authentication API
│   ├── categoryService.ts # Category API
│   ├── customerService.ts # Customer API
│   ├── itemService.ts    # Item API
│   └── orderService.ts   # Order API
└── types/                # TypeScript type definitions
    └── index.ts          # All type definitions
\`\`\`

## API Integration

The application is designed to work with a REST API. Update the `NEXT_PUBLIC_API_URL` environment variable to point to your backend API.

### Expected API Endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth` - Get all users
- `DELETE /api/auth/:id` - Delete user
- `GET /api/item-categories` - Get categories
- `POST /api/item-categories` - Create category
- `DELETE /api/item-categories/:id` - Delete category
- `GET /api/items` - Get items
- `POST /api/items` - Create item
- `DELETE /api/items/:id` - Delete item
- `GET /api/customers` - Get customers
- `POST /api/customers` - Create customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

## Usage

1. **Login**: Use your credentials to access the system
2. **Dashboard**: View overview statistics and alerts
3. **Categories**: Manage product categories
4. **Items**: Add and manage inventory items
5. **Users**: Manage system users (admin only)
6. **Customers**: Handle customer information
7. **Orders**: Process and track orders

## Features in Detail

### Order Management
- Create orders for new or existing customers
- Add multiple items with quantity and pricing
- Track payment status and calculate balances
- Update order status (Pending, Processing, Completed, Cancelled)
- View detailed order information

### Search & Filtering
- Real-time search across all data tables
- Filter by categories, roles, status, etc.
- Advanced filtering options for better data management

### Theme Support
- Automatic dark/light mode detection
- Manual theme switching
- Persistent theme preferences

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.