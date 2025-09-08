# 🎯 TechKwiz v8 - Interactive Tech Quiz Application

A modern, responsive quiz application built with Next.js 15, React 19, and TypeScript. Features real-time coin rewards, achievements, and an engaging user experience.

## ✨ Features

- 🎮 **Interactive Quiz System** - Multiple categories with varying difficulty levels
- 🪙 **Coin Reward System** - Earn coins for correct answers and achievements
- 🏆 **Achievement System** - Unlock achievements and track progress
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop
- 🎨 **Modern UI/UX** - Built with Tailwind CSS and Framer Motion animations
- 📊 **Analytics Integration** - Google Analytics 4 support
- 🚨 **Error Monitoring** - Sentry integration for production error tracking
- 🔐 **User Management** - Local storage-based user profiles
- 🎯 **Performance Optimized** - Fast loading and smooth interactions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jaseem66caj/techkwiz-quiz-app-v2.git
   cd techkwiz-v8
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:visual` - Run Playwright visual tests
- `npm run test:e2e:stable` - Run stable E2E tests

### Project Structure

```
src/
├── app/                 # Next.js 13+ app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Homepage
│   ├── quiz/           # Quiz pages
│   └── start/          # Category selection
├── components/         # Reusable components
├── data/              # Quiz database and static data
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🎮 How to Play

1. **Start Quiz** - Choose a category from the start page
2. **Answer Questions** - Select your answer from multiple choices
3. **Earn Coins** - Get 25 coins for each correct answer
4. **Unlock Achievements** - Complete challenges to earn special rewards
5. **Track Progress** - View your stats and coin balance

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for full list):

- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_ANALYTICS_ID` - Google Analytics measurement ID
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error monitoring DSN
- `NEXT_PUBLIC_ENABLE_TEST_PAGES` - Enable/disable test pages

### Features Configuration

- **Test Pages**: Automatically disabled in production
- **Analytics**: Configurable Google Analytics integration
- **Coin System**: Customizable reward amounts and limits

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Tablet Support** - Enhanced experience on tablets
- **Desktop** - Full-featured desktop interface
- **Touch Friendly** - Optimized for touch interactions

## 🎨 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Testing**: Playwright
- **Deployment**: Vercel-ready

## 🚀 Deployment

### ✅ Live on Vercel (Production Ready)

**🎉 TechKwiz v8 is now LIVE!**

- **Status**: ✅ **DEPLOYED AND RUNNING**
- **Hosting**: Vercel with automatic deployments
- **Error Monitoring**: Sentry integration active
- **Performance**: Optimized for production

### Automatic Deployments

The application automatically deploys on every push to main:

1. **GitHub Integration**: ✅ Connected to Vercel
2. **Environment Variables**: ✅ Configured with Sentry DSN
3. **Build Process**: ✅ Automatic optimization and deployment
4. **Monitoring**: ✅ Real-time error tracking with Sentry

### GitHub Actions (Build Artifacts)

Alternative deployment via GitHub Actions:

1. **Set up GitHub Secrets** (see [GitHub Deployment Guide](docs/GITHUB_DEPLOYMENT.md)):
   - `NEXT_PUBLIC_SENTRY_DSN` - Sentry error monitoring
   - `NEXT_PUBLIC_ANALYTICS_ID` - Google Analytics (optional)
   - `NEXT_PUBLIC_APP_URL` - Your domain (optional)

2. **Download build artifacts** from GitHub Actions and upload to your hosting provider

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

For detailed deployment instructions, see:
- [Vercel Deployment Success](docs/VERCEL_DEPLOYMENT_SUCCESS.md) - Live deployment status
- [GitHub Deployment Guide](docs/GITHUB_DEPLOYMENT.md) - Alternative deployment methods

## 📊 Analytics

The application supports Google Analytics 4 integration:

1. Create a GA4 property
2. Get your Measurement ID (G-XXXXXXXXXX)
3. Add it to your environment variables
4. Enable analytics in your configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `docs/` folder

## 🔄 Version History

- **v8.0.0** - Major refactor with improved architecture
- **v7.x** - Previous stable version
- **v6.x** - Legacy version

---

Built with ❤️ by [Jaseem Abdul Jaleel](https://github.com/jaseem66caj)
