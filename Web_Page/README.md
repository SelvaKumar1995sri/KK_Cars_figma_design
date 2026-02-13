# AutoElite - Premium Car Dealership Website

A full-featured car selling website with user authentication, admin dashboard, and comprehensive analytics.

## Features

### User Features
- **Browse Cars**: View all available vehicles on the homepage
- **Car Details**: Detailed car information (requires login)
- **Enquiry System**: Submit enquiries for cars of interest
- **Authentication**: Sign up/sign in with email or Google OAuth
- **Customer Testimonials**: See feedback from satisfied customers

### Admin Features
- **Dashboard Analytics**:
  - Total sales and profit tracking
  - Monthly/yearly sales graphs
  - Sales by brand distribution
  - Customer conversion metrics
  - New enquiries and conversions count

- **Car Management**:
  - Add new cars to inventory
  - Remove cars from listings
  - Manage car details (price, specs, images)

- **Enquiry Management**:
  - View all customer enquiries
  - Update enquiry status (pending, contacted, converted)
  - Real-time notifications for new enquiries

- **Sales Tracking**:
  - Record completed sales
  - Track profit per sale
  - View sales history

- **Testimonials**:
  - Add customer testimonials
  - Showcase on homepage

## Setup Instructions

### 1. Initial Setup

After the app loads, you'll need to:

1. **Create an Account**: 
   - Click "Sign In / Register" in the top right
   - Use the "Sign Up" tab to create an account
   - Or sign in with Google (requires OAuth setup - see below)

2. **Become Admin**:
   - After signing in, you'll see a "Quick Setup" panel in the bottom right
   - Click "Become Admin" to grant yourself admin privileges
   - Refresh the page to see the "Admin" link in the navigation

3. **Load Sample Data** (Optional):
   - Click "Load Sample Data" in the Quick Setup panel
   - This adds 3 sample cars, testimonials, and sales records
   - Refresh the page to see the data

### 2. Google OAuth Setup (Optional)

To enable Google sign-in, you must configure OAuth in Supabase:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to Authentication → Providers
3. Enable Google provider
4. Follow the instructions at: https://supabase.com/docs/guides/auth/social-login/auth-google
5. Configure OAuth credentials in Google Cloud Console
6. Add authorized redirect URIs

**Note**: Without completing OAuth setup, the "Sign in with Google" button will show an error.

## User Flow

### For Regular Users:
1. **Homepage**: Browse featured vehicles and testimonials
2. **Click on Car**: Redirected to login/register if not authenticated
3. **After Login**: Can view full car details
4. **Enquire**: Submit enquiries for cars of interest

### For Admins:
1. **Access Admin Dashboard**: Click "Admin" in navigation
2. **View Analytics**: See sales graphs, profit metrics, and statistics
3. **Manage Cars**: Add new vehicles or remove existing ones
4. **Handle Enquiries**: View and update customer enquiry status
5. **Track Sales**: Record new sales and track profits
6. **Add Testimonials**: Showcase happy customers

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Charts**: Recharts
- **Animations**: Motion (Framer Motion)
- **Backend**: Supabase (Authentication, Database)
- **Server**: Hono (Edge Functions)
- **Database**: Supabase KV Store

## Data Structure

### Cars
- Name, Brand, Model, Year
- Price, Mileage, Fuel Type
- Condition (New/Used/Certified)
- Images, Description, Specifications

### Enquiries
- User information (name, email)
- Car of interest
- Status (pending, contacted, converted)
- Timestamp

### Sales
- Car details (brand, name)
- Sale price and profit
- Customer name
- Sale date

### Testimonials
- Customer name and image
- Car purchased
- Rating (1-5 stars)
- Feedback text
- Purchase date

## Design Theme

The website features a rugged, premium design with:
- **Color Scheme**: Dark slate background with orange-to-red gradients
- **Typography**: Bold headings with modern sans-serif fonts
- **Animations**: Smooth transitions and scroll-based animations
- **Responsive**: Fully responsive design for all screen sizes

## Important Notes

⚠️ **PII Compliance**: Figma Make is not designed for collecting Personally Identifiable Information (PII) or securing sensitive data. Ensure you comply with data protection regulations when collecting user information.

⚠️ **Demo Purpose**: The "Quick Setup" panel and admin setup functionality are for demonstration purposes only. In production, implement proper admin role assignment.

⚠️ **OAuth Setup**: Google sign-in requires additional configuration in Supabase. Follow the setup instructions above.

## Support

For issues or questions:
- Check the browser console for error messages
- Ensure you've completed all setup steps
- Verify Supabase connection is active
- For OAuth issues, verify Google Cloud Console configuration

---

**AutoElite** - Your Premium Car Dealership Solution 🚗✨
