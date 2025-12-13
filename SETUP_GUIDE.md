# Booksy Clone - Complete Setup Guide

## 🎉 Welcome to Your Booking Platform!

This is a **production-ready** booking platform similar to Booksy, built with React, TypeScript, and Lovable Cloud (powered by Supabase).

---

## ✨ Features

### For Clients:
- 🔍 Search and browse local businesses
- 📅 Book appointments with real-time availability
- 👤 User dashboard to manage bookings
- ⭐ View business profiles, services, and reviews
- 📱 Fully responsive design

### For Business Owners:
- 🏢 Create and manage business profile
- 💼 Add/edit services with pricing and duration
- 👥 Manage staff members
- ⏰ Set business hours and availability
- 📊 View booking analytics (24h, 7d, 30d stats)
- ✅ Accept, cancel, or complete bookings
- 📈 Track performance metrics

### Technical Features:
- 🔐 Secure authentication (email/password)
- 💾 Real-time database with Supabase
- 🎨 Modern UI with Tailwind CSS
- 📱 Mobile-responsive design
- 🔒 Row-level security policies
- ⚡ Fast performance with optimized queries

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm installed
- A modern web browser

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <project-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:8080`
   - The app is now running!

---

## 👤 Demo Accounts

### Option 1: Create Your Own Account

1. Go to `/auth` and click "Sign Up"
2. Choose account type:
   - **Client**: For booking services
   - **Business**: For offering services

### Option 2: Use Demo Data

1. Sign up as a **Business Owner**
2. Go to Dashboard
3. Click "Create Demo Business"
4. This creates a pre-configured hair salon with:
   - 5 services
   - 3 staff members
   - Business hours
   - Ready to accept bookings!

---

## 📖 User Guide

### For Clients

#### 1. Searching for Services
- Use the search bar on the homepage
- Browse by category (Salon, Spa, Barbershop, etc.)
- Filter results by location

#### 2. Booking an Appointment
1. Click on a business to view details
2. Select a service
3. Choose a staff member
4. Pick date and time
5. Confirm booking

#### 3. Managing Bookings
- Go to Dashboard → My Bookings
- View all your appointments
- Cancel bookings if needed

### For Business Owners

#### 1. Creating Your Business
1. Sign up as Business Owner
2. Go to Dashboard → "Add Business"
3. Fill in business details:
   - Name, category, description
   - Address and contact info
4. Submit to create

#### 2. Managing Services
1. Go to Business → Manage → Services tab
2. Click "Add Service"
3. Enter:
   - Service name and description
   - Duration (in minutes)
   - Price
4. Save service

#### 3. Adding Staff
1. Go to Staff tab
2. Click "Add Staff"
3. Enter staff details:
   - Name and title
   - Bio (optional)
4. Save staff member

#### 4. Setting Business Hours
1. Go to Hours tab
2. Toggle each day open/closed
3. Set start and end times
4. Click "Save Changes"

#### 5. Managing Bookings
1. Go to Bookings tab
2. View all appointments
3. Actions available:
   - **Confirm** pending bookings
   - **Cancel** bookings
   - **Complete** finished appointments
4. Filter by status (All, Pending, Confirmed, Cancelled)

#### 6. Viewing Analytics
1. Go to Analytics tab
2. See metrics:
   - Total bookings
   - Last 24 hours bookings
   - Last 7 days bookings
   - Last 30 days bookings
   - Top services
   - Recent activity

---

## 🗄️ Database Structure

### Main Tables:
- **profiles**: User accounts (clients & owners)
- **businesses**: Business listings
- **services**: Services offered by businesses
- **staff**: Staff members
- **bookings**: Appointment bookings
- **business_hours**: Operating hours
- **staff_hours**: Staff availability
- **reviews**: Customer reviews

### Security:
- Row-Level Security (RLS) enabled on all tables
- Business owners can only manage their own data
- Clients can only see and manage their own bookings
- Public can view active businesses and services

---

## 📂 Project Structure

### `src/pages`
Core application pages handling routing and main views:
- **Home.tsx**: Landing page featuring search functionality, categories, and featured businesses.
- **Auth.tsx**: Authentication page handling both Login and Signup flows.
- **Search.tsx**: Advanced search results page with filtering by category, location, and price.
- **Business.tsx**: Public-facing business profile view for clients to browse services and book appointments.
- **BusinessCreate.tsx**: Multi-step wizard for business owners to register their business.
- **BusinessManage.tsx**: Comprehensive dashboard for business owners to manage their operations.
- **Dashboard.tsx**: Client dashboard for viewing upcoming/past bookings and favorite businesses.
- **Profile.tsx**: User settings page for profile management.
- **NotFound.tsx**: Custom 404 error page.

### `src/components/business`
Business logic and management components:
- **BookingsManager.tsx**: Interface for processing bookings (confirm, cancel, complete).
- **BusinessAnalytics.tsx**: Visual charts and metrics for business performance tracking.
- **HoursManager.tsx**: Tool for configuring weekly operating hours and exceptions.
- **ServicesManager.tsx**: CRUD interface for managing service menu, pricing, and durations.
- **StaffManager.tsx**: Staff member management (add, edit, remove).
- **StaffScheduleManager.tsx**: Individual schedule management for staff members.
- **ReviewForm.tsx**: Component allowing clients to submit reviews and ratings.
- **PortfolioManager.tsx** & **PortfolioGallery.tsx**: Image management for business portfolios.

### `src/lib`
Core utilities and configuration:
- **auth.tsx**: React Context provider for Supabase authentication state.
- **i18n.ts**: Internationalization configuration (i18next).
- **algeria.ts**: Geographic data for Algeria (Wilayas and Communes).
- **utils.ts**: Shared helper functions and type definitions.

### `src/components/ui`
Reusable design system components built with Radix UI and Tailwind CSS (e.g., Button, Dialog, Input, Toast).

---

## 🎨 Customization

### Changing Colors
Edit `src/index.css` to customize the design system:
- `--primary`: Main brand color (teal/turquoise)
- `--accent`: Accent color (gold)
- `--secondary`: Secondary color
- Update gradients and shadows

### Adding Features
The codebase is modular:
- Components in `src/components/`
- Pages in `src/pages/`
- Business logic in `src/components/business/`

---

## 📊 Analytics & Metrics

The platform tracks:
- **Total bookings**: All-time booking count
- **Today's bookings**: Bookings for current day
- **Recent bookings**: Last 24 hours, 7 days, 30 days
- **Top services**: Most popular services
- **Revenue tracking**: Calculate from completed bookings

---

## 🔧 Technical Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL with RLS
- **Authentication**: Supabase Auth
- **Routing**: React Router v6
- **Date handling**: date-fns
- **Forms**: React Hook Form + Zod validation

---

## 🐛 Troubleshooting

### "No businesses found"
- Make sure you've created a business as a business owner
- Or use the "Create Demo Business" feature

### "Failed to create booking"
- Ensure you're logged in as a client
- Check that the staff member is available
- Verify the time slot isn't already booked

### "Permission denied"
- Check you're using the correct account type
- Business owners can only manage their own businesses
- Clients can only book and view their own bookings

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📱 Mobile Support

The app is fully responsive:
- Mobile-first design
- Touch-friendly interfaces
- Collapsible navigation
- Optimized layouts for all screen sizes

---

## 🚀 Deployment

The app is ready to deploy:

1. **Via Lovable**:
   - Click "Publish" in the Lovable editor
   - Your app goes live instantly

2. **Custom Domain**:
   - Go to Project Settings → Domains
   - Connect your custom domain

3. **Self-Hosting**:
   ```bash
   npm run build
   # Deploy the `dist` folder to your hosting provider
   ```

---

## 🔐 Security Features

- Email/password authentication
- Auto-confirmed signups (for development)
- Row-level security on all tables
- Secure password hashing
- Input validation with Zod
- SQL injection prevention

---

## 📝 Environment Variables

All environment variables are auto-configured by Lovable Cloud:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

No manual configuration needed!

---

## 🎓 Learning Resources

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 💡 Tips for Success

1. **Start with Demo Data**: Use the demo business creator to understand the platform
2. **Test Booking Flow**: Create a client account and book appointments
3. **Customize Design**: Change colors to match your brand
4. **Add Real Data**: Replace demo data with actual business information
5. **Enable Reviews**: Allow clients to leave feedback
6. **Monitor Analytics**: Track your business performance

---

## 🤝 Support

For issues or questions:
1. Check this guide first
2. Review error messages in console
3. Test with demo data
4. Refer to Lovable documentation

---

## 📄 License

This project is open source and available for personal and commercial use.

---

## 🎉 Get Started Now!

1. Sign up as a Business Owner
2. Click "Create Demo Business"
3. Explore all features
4. Start accepting bookings!

**Happy Booking! 🚀**
