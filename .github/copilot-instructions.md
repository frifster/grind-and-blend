# Grind & Blend - Next.js Coffee Shop Website

**ALWAYS follow these instructions first. Only use additional search and context gathering if the information here is incomplete or found to be in error.**

This is a Next.js 15 coffee shop website built with React 19, TypeScript, Tailwind CSS, and Supabase for authentication and database. The application features a modern landing page, menu display, user authentication system, and admin panel for role-based access control.

## Working Effectively

### Initial Setup and Dependencies
- Install pnpm package manager: `npm install -g pnpm`
- Install project dependencies: `pnpm install` -- takes 26 seconds
- Approve build scripts when prompted: Select all packages (@prisma/client, @prisma/engines, prisma, sharp) and approve
- Create environment file: Copy the provided `.env.local` configuration below

### Required Environment Variables (.env.local)
```env
# Local Supabase Configuration (for development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

### Build and Development Commands
- **NEVER CANCEL**: Build process: `pnpm run build` -- takes 31 seconds. Set timeout to 60+ minutes for CI environments.
- **IMPORTANT**: Build will FAIL in restricted network environments due to Google Fonts fetching (this is expected and documented)
- Run linting: `pnpm run lint` -- takes 3 seconds. Expect warnings about `<img>` vs `<Image>` and React hooks dependencies
- Start development server: `pnpm run dev` -- takes 2-3 seconds, runs on http://localhost:3000
- Production server: `pnpm run start` -- requires build to be completed first

### **CRITICAL Build Issue - Google Fonts Network Dependency**
The build process will FAIL in environments without internet access or with restricted networks because it attempts to fetch Google Fonts from fonts.googleapis.com. This is a known limitation:
- **Expected Error**: `FetchError: request to https://fonts.googleapis.com/css2?family=Inter...`
- **Workaround**: For isolated environments, temporarily comment out the `Inter` font import in `src/app/layout.tsx`
- **Production**: Works normally in environments with internet access

## Validation

### Manual Testing Requirements
After making any changes, ALWAYS validate functionality by:
1. **Start the development server**: `pnpm run dev`
2. **Test core pages**: Navigate to homepage (`/`), menu page (`/menu`), and other routes
3. **Test API endpoints**: Verify `/api/hello` returns "Hello, Next.js!"
4. **Test navigation**: Click through main navigation links to ensure pages load
5. **Verify environment variables**: Check that Supabase configuration loads without errors
6. **Run linting**: `pnpm run lint` before committing changes

### Application Functionality Testing
- **Homepage**: Displays landing page with coffee drinks, eggdrop section, working navigation
- **Menu page**: Shows menu image and maintains consistent navigation/footer
- **API routes**: `/api/hello`, `/api/admin/*`, `/api/debug/*` endpoints are functional
- **Authentication system**: Supabase integration for user management (requires local Supabase instance)
- **Admin panel**: Role-based access control system at `/admin` (authentication required)

### No Tests Available
**WARNING**: This project has no automated testing framework. All validation must be done manually through the browser and API testing.

## Project Structure

### Key Directories
```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints (admin, debug, hello)
│   ├── admin/             # Admin panel pages
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout with navigation
├── components/            # React components
│   ├── Landing/          # Homepage sections
│   ├── Layout/           # Navigation, footer, containers
│   ├── Shared/           # Reusable UI components
│   └── auth/             # Authentication components
├── assets/               # SVG assets and images
├── lib/                  # Utilities and Supabase client
└── hooks/                # Custom React hooks

supabase/
├── config.toml           # Local Supabase configuration
├── migrations/           # Database schema migrations
└── .gitignore           # Supabase-specific ignores
```

### Important Files
- `package.json`: Project dependencies and scripts
- `.env.local`: Local environment variables (create from template above)
- `next.config.js`: Next.js configuration with React Compiler enabled
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration with path mapping (`@*` -> `./src/*`)

## Common Tasks

### Package Management (Use pnpm, NOT npm)
- Add dependency: `pnpm add package-name`
- Add dev dependency: `pnpm add -D package-name`
- Remove dependency: `pnpm remove package-name`
- Update dependencies: `pnpm update`

### Code Quality
- Run linting: `pnpm run lint` 
- **Expected warnings**: 
  - `<img>` vs `<Image />` from next/image (non-blocking)
  - React hooks dependency arrays (non-blocking)
- **Format code**: No prettier script available, but `.prettierrc` exists
- **TypeScript checking**: Integrated into build process

### Development Workflow
1. **Start development**: `pnpm run dev`
2. **Make changes**: Edit files in `src/` directory
3. **Test changes**: Navigate to affected pages, test functionality
4. **Lint code**: `pnpm run lint` 
5. **Build (optional)**: `pnpm run build` - only if testing production build
6. **Commit changes**: Standard git workflow

## Technology Stack Details

### Dependencies
- **React**: 19.0.0-rc (experimental release candidate)
- **Next.js**: 15.0.0-rc.0 (experimental release candidate)
- **TypeScript**: 5.4.5
- **Tailwind CSS**: 3.4.3 for styling
- **Supabase**: Authentication and database (@supabase/auth-helpers-nextjs, @supabase/supabase-js)
- **Framer Motion**: 11.1.9 for animations
- **Package Manager**: pnpm (pnpm-lock.yaml present)

### Configuration Notes
- **React Compiler**: Enabled experimentally in next.config.js
- **Path Mapping**: `@*` resolves to `./src/*`
- **Supabase**: Configured for local development on port 54321
- **Development**: Runs on http://localhost:3000

## Troubleshooting

### Build Failures
- **Google Fonts Error**: Expected in restricted networks, see "CRITICAL Build Issue" section above
- **TypeScript Errors**: Run `pnpm run lint` to identify issues
- **Missing Dependencies**: Run `pnpm install` to restore packages

### Development Issues
- **Port 3000 in use**: Kill existing processes or use different port with `pnpm run dev -- -p 3001`
- **Environment Variables**: Ensure `.env.local` exists with correct Supabase keys
- **Supabase Connection**: Check that environment variables match supabase/config.toml settings

### Common File Locations
- **Navigation**: `src/components/Layout/NavBar.tsx`
- **Homepage**: `src/app/page.tsx`  
- **API Routes**: `src/app/api/*/route.ts`
- **Global Styles**: `src/app/globals.css`
- **Supabase Client**: `src/lib/supabase.ts`

## NEVER CANCEL Commands
- **NEVER CANCEL**: `pnpm run build` - Build takes up to 31 seconds normally, can take much longer in CI environments
- **Set timeouts of 60+ minutes** for build commands in automated environments
- **Wait for completion** - premature cancellation can corrupt build state

Always run these validation steps after making changes to ensure the application remains functional.