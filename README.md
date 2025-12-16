# Booksy Clone - Service Booking Platform

## 📄 License & Legal Notice

**© 2024 All Rights Reserved.**

This software and associated documentation files (the "Software") are the proprietary property of the owner.

**STRICTLY PROHIBITED ACTS:**

- Unauthorized copying of this Software, via any medium, is strictly prohibited.
- Redistribution, modification, or commercial use of this codebase, in whole or in part, without express written permission is not allowed.
- This codebase is provided for the sole purpose of the intended assignment or usage as authorized by the owner.

Any violation of these terms will result in legal action.

---

## 🏗️ Project Structure

This project follows a scalable and modular React architecture. Below is a detailed breakdown of the file system.

```
/
├── public/              # Static assets (images, icons, etc.)
├── src/
│   ├── assets/          # Project-specific local assets
│   ├── components/      # Reusable UI and Functional Components
│   │   ├── business/    # Complex business logic components (e.g., BookingsManager)
│   │   └── ui/          # Primitive design system components (Button, Card, Input)
│   ├── hooks/           # Custom React hooks (e.g., use-toast)
│   ├── integrations/    # External service configurations (Supabase types)
│   ├── lib/             # Utility functions and core configuration
│   │   ├── auth.tsx     # Authentication context provider
│   │   ├── utils.ts     # Helper functions (CN, formatting)
│   │   └── i18n.ts      # Internationalization setup
│   ├── locales/         # Translation JSON files (en, fr, ar)
│   ├── pages/           # Main route components (Views)
│   ├── App.tsx          # Main application router and provider setup
│   └── main.tsx         # Entry point mounting React to DOM
├── supabase/            # Supabase configuration and cloud functions
├── .env                 # Environment variables
├── package.json         # Project dependencies and scripts
└── vite.config.ts       # Vite build configuration
```

### Folder & File Descriptions

- **`src/components/ui`**: Contains atomic UI components built with shadcn/ui and Radix UI. These are the building blocks of the interface (buttons, dialogs, form inputs).
- **`src/components/business`**: Contains "smart" components specific to the business domain, such as `ServicesManager` (for editing prices) or `BookingsManager` (for handling appointments).
- **`src/pages`**: Top-level components that correspond to specific routes (URLs). Each file here typically represents a full screen.
- **`src/lib`**: Housing for essential logic. `auth.tsx` manages user sessions, and `utils.ts` provides class-merging helpers for Tailwind.
- **`src/integrations`**: Generated types for Supabase, ensuring full end-to-end type safety for database queries.

---

## 📂 Detailed File Guide

Here is a comprehensive breakdown of the purpose of each file and folder in the root directory:

### Root Files

- **`.env`**: Stores environment variables like database URLs and API keys. **Never commit this file.**
- **`.gitignore`**: Specifies which files and directories Git should ignore (e.g., `node_modules`, `.env`).
- **`components.json`**: Configuration file for shadcn/ui components.
- **`eslint.config.js`**: Configuration for ESLint to ensure code quality and consistent styling.
- **`index.html`**: The entry point of the application. It contains the root `div` where React attaches.
- **`package.json`**: Manifest file listing project dependencies, scripts, and metadata.
- **`package-lock.json`**: Locks the exact versions of dependencies to ensure consistent installs.
- **`postcss.config.js`**: Configuration for PostCSS, used here to process Tailwind CSS.
- **`tailwind.config.ts`**: Configuration file for Tailwind CSS (colors, fonts, custom plugins).
- **`tsconfig.json`**: Main TypeScript configuration file.
- **`tsconfig.app.json`**: TypeScript config specific to the application code.
- **`tsconfig.node.json`**: TypeScript config for Node.js-based tools (like Vite).
- **`vercel.json`**: Configuration for deploying the application on Vercel.
- **`vite.config.ts`**: Configuration for the Vite build tool and development server.

### Directories

- **`public/`**: Contains static assets that are served exactly as-is (e.g., `favicon.ico`, `robots.txt`).
- **`src/`**: The source code of the application.
- **`supabase/`**: Contains Supabase-specific configurations and serverless functions.

---

## 🛠️ Tech Stack

This project leverages a modern, performance-oriented stack:

### Core Frameworks

- **React 18**: Frontend library for building user interfaces.
- **TypeScript**: Static typing for robust code quality and better developer experience.
- **Vite**: Next-generation frontend tooling for blazing fast builds and HMR.

### Styling & UI

- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **shadcn/ui**: Re-usable components built using Radix UI and Tailwind.
- **Lucide React**: Beautiful, consistent icon set.

### Backend & Data

- **Supabase**: Open source Firebase alternative providing Database, Auth, and Realtime subscriptions.
- **PostgreSQL**: The underlying robust relational database.
- **React Query (TanStack Query)**: Powerful asynchronous state management for fetching database data.

### Utilities

- **i18next**: Complete internationalization framework (supports English, French, Arabic).
- **Zod**: TypeScript-first schema declaration and validation library.
- **React Hook Form**: Performant, flexible and extensible forms with easy validation.
- **date-fns**: Comprehensive toolset for manipulating JavaScript dates.

---

## 📱 Key Pages & Features

- **Home (`/`)**:
  - The landing page.
  - Features a search bar, category quick-links, and promotional banners.
- **Search (`/search`)**:
  - Advanced finding mechanism.
  - Filters businesses by category, city, and name.
- **Business Profile (`/business/:id`)**:

  - The public face of a business.
  - Clients can view services, staff, photos, reviews, and book appointments here.

- **Dashboard (`/dashboard`)**:

  - **For Clients**: View upcoming/past bookings and manage favorites.
  - **For Businesses**: Access the business creation and management tools.

- **Business Management (`/business/:id/manage`)**:

  - **Protected Route**: Only accessible to the business owner.
  - Tabs for managing: Services, Staff, Hours, Bookings, and Analytics.

- **Auth (`/auth`)**:
  - Unified login and signup interface.
  - Handles Email/Password authentication seamlessly.

---

## 🔐 Security Measures

Security is a top priority in this application:

1. **Row Level Security (RLS)**:

   - Implemented directly in the PostgreSQL database via Supabase.
   - Ensures users can ONLY access data they are permitted to see (e.g., a business owner cannot see another business's bookings).

2. **Authentication**:

   - Powered by Supabase Auth (GoTrue).
   - Secure session management and JWT handling.
   - Passwords are never stored in plain text.

3. **Input Validation**:

   - All forms use **Zod** schemas to validate input before it is ever sent to the server.
   - Prevents malformed data and mitigate common injection risks.

4. **Environment Variables**:
   - Sensitive keys (like API URLs) are managed via `.env` files.
   - `VITE_` prefix ensures only safe public keys are exposed to the client bundle.

---

## ℹ️ Further Documentation

For detailed installation instructions, setup steps, and troubleshooting, please refer to the **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** file included in this repository.
