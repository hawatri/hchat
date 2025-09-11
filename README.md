# paprichat 💬

A modern, real-time chat application built with Next.js, Convex, and Clerk authentication. Connect with friends and colleagues in a beautiful, responsive chat interface.

![paprichat](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![Convex](https://img.shields.io/badge/Convex-Database-orange?style=flat)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?style=flat)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-cyan?style=flat&logo=tailwindcss)

## ✨ Features

- **Real-time Messaging**: Instant message delivery with live updates
- **User Authentication**: Secure authentication powered by Clerk
- **Contact Management**: Add contacts by email and manage your contact list
- **Message History**: Persistent message storage with conversation threading
- **Message Controls**: Delete your own messages and clear conversation history
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices
- **Modern UI/UX**: Clean, gradient-based design with smooth animations
- **Profile Integration**: User profiles with avatars and display names
- **Mobile-First**: Optimized mobile experience with collapsible sidebar

## 🚀 Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[shadcn/ui](https://ui.shadcn.com/)** - Reusable component library

### Backend & Database
- **[Convex](https://www.convex.dev/)** - Real-time backend-as-a-service
- **Real-time Queries** - Automatic UI updates when data changes
- **ACID Transactions** - Reliable data consistency
- **Serverless Functions** - Scalable backend operations

### Authentication
- **[Clerk](https://clerk.com/)** - Complete authentication solution
- **Social Logins** - Multiple authentication providers
- **User Management** - Profile management and user sessions
- **JWT Integration** - Secure token-based authentication

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **TypeScript Config** - Strict type checking

## 🏗️ Architecture

### Database Schema
```typescript
// Messages table
messages: {
  content: string
  senderId: string
  receiverId: string
  timestamp: number
}

// Users table  
users: {
  clerkUserId: string
  email?: string
  username?: string
  name: string
  avatarUrl?: string
  lastSeen: number
}

// Contacts table
contacts: {
  ownerId: string
  contactId: string
  createdAt: number
}

// Conversation clearing
clears: {
  ownerId: string
  otherUserId: string
  clearedAt: number
}
```

### Key Components
- **ChatLayout**: Main chat interface with sidebar and message area
- **ConvexClientProvider**: Convex client setup with Clerk integration
- **Authentication Flow**: Clerk-powered sign-in/sign-up

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Clerk account
- Convex account

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/paprichat.git
cd paprichat
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWT_ISSUER_DOMAIN=your_clerk_jwt_issuer_domain

# Convex Configuration  
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

### 4. Set Up Convex
```bash
# Install Convex CLI globally
npm install -g convex

# Login to Convex
npx convex dev

# Deploy your functions
npx convex deploy
```

### 5. Configure Clerk
1. Create a new application in your [Clerk Dashboard](https://dashboard.clerk.com/)
2. Configure your authentication providers
3. Set up JWT templates for Convex integration
4. Add your domain to allowed origins

### 6. Run the Development Server
```bash
npm run dev
# or
yarn dev
# or  
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Clerk Setup
1. Enable email/password authentication
2. Configure social providers (optional)
3. Set up JWT template with `convex` as the audience
4. Configure webhook endpoints (if needed)

### Convex Setup
1. Deploy your schema and functions
2. Configure authentication with Clerk JWT issuer
3. Set up proper indexes for performance

## 🎯 Usage

### Adding Contacts
1. Click the "+" button in the contacts sidebar
2. Enter a user's email address
3. Click "Add" to send a contact request

### Sending Messages
1. Select a contact from the sidebar
2. Type your message in the input field
3. Press Enter or click the send button

### Managing Conversations
- **Delete Messages**: Click on your own messages to reveal delete button
- **Clear Chat**: Use the menu (⋮) to clear conversation history
- **Delete Contact**: Remove contacts and all associated messages

### Mobile Experience
- Tap the menu button (☰) to open contacts sidebar
- Sidebar automatically closes when selecting a contact
- Optimized touch interactions and responsive design

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

Make sure to:
1. Set all environment variables
2. Configure Clerk allowed origins
3. Update Convex deployment settings

## 📱 Features in Detail

### Real-time Updates
- Messages appear instantly without page refresh
- Contact list updates when new contacts are added
- Online status indicators

### Message Features
- Timestamp grouping (shows time every 5 minutes)
- Message deletion (sender only)
- Character-by-character typing detection
- Auto-scroll to latest messages

### Contact Management
- Email-based contact discovery
- Automatic reciprocal contact creation
- Contact deletion with conversation cleanup
- Profile picture integration

### User Experience
- Smooth animations and transitions
- Loading states and error handling
- Mobile-optimized interface
- Gradient-based modern design
- Accessibility features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Convex](https://www.convex.dev/)** for the excellent real-time backend
- **[Clerk](https://clerk.com/)** for seamless authentication
- **[Vercel](https://vercel.com/)** for Next.js and deployment platform
- **[Tailwind CSS](https://tailwindcss.com/)** for the utility-first styling approach

## 📞 Support

If you have any questions or run into issues:

1. Check the [Convex documentation](https://docs.convex.dev/)
2. Review [Clerk documentation](https://clerk.com/docs)
3. Create an issue in this repository
4. Join the community discussions

---

**Built with ❤️ using modern web technologies**