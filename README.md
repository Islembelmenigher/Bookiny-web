# Booksy Clone - Service Booking Platform

A complete, production-ready service booking platform built with React, TypeScript, and Lovable Cloud. Book appointments with local businesses instantly!

## 🌟 Features

- ✅ **Client Booking System** - Search, browse, and book services
- ✅ **Business Management** - Full dashboard for service providers
- ✅ **Real-time Availability** - Live booking calendar
- ✅ **Analytics Dashboard** - Track bookings and performance
- ✅ **Staff Management** - Add and manage team members
- ✅ **Service Catalog** - Create and price your offerings
- ✅ **Responsive Design** - Works on all devices
- ✅ **Secure Authentication** - Email/password login

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Then open `http://localhost:8080` in your browser.

## 📖 Full Documentation

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for:
- Complete installation instructions
- User guides (clients & business owners)
- Database structure
- Customization guide
- Troubleshooting tips

## 🎯 Demo Accounts

### Test the Platform:

1. **Sign up as Business Owner** at `/auth`
2. Click **"Create Demo Business"** in dashboard
3. Get a pre-configured hair salon with services, staff, and hours
4. Start accepting bookings!

Or create your own business from scratch.

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL with RLS
- **Auth**: Supabase Authentication

## 📱 Key Pages

- `/` - Home with search and categories
- `/search` - Browse all businesses
- `/business/:id` - Business profile with booking
- `/dashboard` - User/owner dashboard
- `/business/:id/manage` - Business management (owners only)

## 🎨 Design System

Modern, professional design with:
- Teal/turquoise primary color
- Gold accent highlights  
- Clean, spacious layouts
- Smooth animations
- Mobile-first responsive

## 🔐 Security

- Row-Level Security on all tables
- Secure password hashing
- Input validation with Zod
- SQL injection prevention
- Business data isolation

## 📊 Analytics

Business owners get:
- Total bookings count
- Last 24 hours bookings
- 7-day and 30-day trends
- Top performing services
- Recent booking activity

---

## Project info

**URL**: https://lovable.dev/projects/922aa8eb-57dd-4e10-a459-9bc92c835b65

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/922aa8eb-57dd-4e10-a459-9bc92c835b65) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/922aa8eb-57dd-4e10-a459-9bc92c835b65) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
