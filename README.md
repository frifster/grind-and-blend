# Grind and Blend Project

This project was developed with [Node.js](https://nodejs.org/), [React](https://reactjs.org/),
and [TypeScript](https://www.typescriptlang.org/).

## Dependencies

- React version: 19.0.0-rc-6f23540c7d-20240528
- TypeScript version: 5.4.5
- Next.js version: 15.0.0-rc.0
- Tailwind CSS version: 3.4.3
- Sass version: 1.77.1
- Clerk version: 5.0.8

## Environment Setup

### Required Environment Variables

This project requires Supabase environment variables to function properly.

#### Local Development

For local development, the project is already configured to use local Supabase instance. The `.env.local` file contains:

```env
# Local Supabase Configuration (for development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Production Environment

For production deployment, you need to replace these with your actual Supabase project credentials:

```env
# Production Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Settings > API
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Vercel Deployment

When deploying to Vercel, add these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each of the environment variables listed above
4. Redeploy your application

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` should only be used on the server side and never exposed to the client.

### Troubleshooting

#### "Error: supabaseKey is required" in Vercel

This error occurs when the required Supabase environment variables are not configured in your Vercel deployment. To fix this:

1. **Check Environment Variables in Vercel**:
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Ensure all three variables are present:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

2. **Verify Variable Values**:
   - Make sure the values are your actual Supabase project credentials
   - Don't use the local development values (`http://127.0.0.1:54321`)
   - Get the correct values from your Supabase project dashboard

3. **Redeploy**:
   - After adding/updating environment variables, trigger a new deployment
   - Environment variables are only applied to new deployments

#### "Missing NEXT_PUBLIC_SUPABASE_URL environment variable"

This error indicates that the environment variables are not properly configured. Check:

1. **Local Development**: Ensure `.env.local` file exists and contains the required variables
2. **Production**: Ensure environment variables are set in your hosting platform (Vercel, Netlify, etc.)
3. **Variable Names**: Make sure variable names are exactly as specified (case-sensitive)

## Grind and Blend

Grind and Blend is a coffee shop that offers a variety of coffee-based drinks, pastries, sandwiches, and non-coffee
drinks. The shop is located in the Calamba,Laguna and is open from 8:00 AM to 10:00 PM every day.

This website is for the Grind and Blend coffee shop. It allows customers to view the menu, place orders, and view the
shop's location.

## Features for future development

### Menu

- View the menu [ ]
- Filter the menu by category [ ]
- Search for items in the menu [ ]
- View item details [ ]

### Order Online

- Add items to the cart [ ]
- View the cart [ ]
- Remove items from the cart [ ]
- Place an order [ ]
- View order history [ ]
- View order details [ ]
- Cancel an order [ ]
- View the status of an order [ ]
- View the estimated time of arrival for an order [ ]
- View the total cost of an order [ ]
- View the total cost of all orders [ ]
- View the total number of orders [ ]
- Implement Notifications [ ]
    - Implement SMS notifications [ ]
    - Implement email notifications [ ]
    - Implement push notifications [ ]

### Location

- View the shop's location [ ]
- Get directions to the shop [ ]
- View the shop's hours [ ]
- View the shop's contact information [ ]
- View the shop's social media links [ ]
- View the shop's reviews [ ]
- Leave a review [ ]
- View the shop's rating [ ]

### User Account

- Create an account [X]
- Log in [X]
- Log out [X]
- View account details [X]
- Edit account details [X]
- Change password [X]
- Reset password [X]
- View order history [ ]
- View order details [ ]

### Admin Account

- Create an admin account [ ]
- Log in [ ]
- Log out [ ]
- View account details [ ]
- Edit account details [ ]
- Change password [ ]
- Reset password [ ]
- View order history [ ]
- View order details [ ]
- View all orders [ ]
- View all users [ ]

### Employee Account

- Create an employee account [ ]
- Log in [ ]
- Log out [ ]
- View account details [ ]
- Edit account details [ ]
- Change password [ ]
- Reset password [ ]
- View order history [ ]
- View order details [ ]
- View all orders [ ]
- View all users [ ]
- View all employees [ ]
- View all admins [ ]
- View all customers [ ]
- View all items [ ]
- View all categories [ ]
- View all reviews [ ]
- View all ratings [ ]
- View all social media links [ ]
- View all contact information [ ]

### Contact

- View the shop's contact information [ ]
- View the shop's social media links [ ]
    - Facebook [ ]
    - Instagram [ ]
    - Twitter [ ]
    - TikTok [ ]
    - YouTube [ ]
    - Pinterest [ ]
- View the shop's reviews [ ]
- Leave a review [ ]

### Rewards

- View the rewards program [ ]
- Sign up for the rewards program [ ]
- View rewards points [ ]
- Redeem rewards points [ ]
- View rewards history [ ]
- View rewards details [ ]
- View rewards status [ ]
- View rewards expiration date [ ]
- View rewards eligibility [ ]
- View rewards requirements [ ]
- View rewards benefits [ ]

## Installation

To get started, you'll need to install the required dependencies: