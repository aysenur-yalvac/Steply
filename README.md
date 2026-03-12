# Steply | Modern Project Management Platform

Steply is a process-oriented, elegant, and high-performance project management platform designed for students and teachers. It combines project tracking, file management, and social interaction features in a modern interface.

## 🚀 Key Features

- **Dynamic Theme System**: Switch between Light and Dark modes with a single click. Your preferences are stored persistently in the browser.
- **Advanced File Management**: Upload files to your projects (5MB limit per file). Your files remain private through Supabase Storage integration and secure RLS policies.
- **Smart Navbar**: A simplified, mobile-responsive navigation interface that dynamically updates based on your authentication status.
- **Teacher Evaluations**: Integrated evaluation system where students can receive ratings and detailed feedback from teachers.
- **Role-Based Access**: Customized dashboards and permission management for Student and Teacher roles.
- **English-Only Localization**: The platform is fully standardized in English for a global professional experience.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16+](https://nextjs.org/) (App Router & Turbopack)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Storage, Authentication)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme Management**: `next-themes`

## 📦 Installation & Setup

### Prerequisites
- Node.js 18.x or later
- Supabase account and project

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/username/steply.git
   cd steply
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: UI components and feature-based modules.
- `src/lib`: Server Actions and common utility functions.
- `src/context`: Auth and other global state providers.
- `supabase`: Database schemas, migrations, and policies.

## 📄 License

This project is an **Auto Step** product and was developed for educational purposes. All rights reserved.
