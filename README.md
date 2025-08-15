# 🎯 TechKwiz-v7 - Interactive Tech Quiz Game

[![Deploy to Hostinger](https://github.com/jaseem66caj/Techkwiz-v7/actions/workflows/deploy-hostinger.yml/badge.svg)](https://github.com/jaseem66caj/Techkwiz-v7/actions/workflows/deploy-hostinger.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

A modern, interactive quiz application built with Next.js that runs entirely in the browser. Test your knowledge across Movies, Social Media, and Influencers categories with engaging animations and a reward system.

> **🧹 Recently Cleaned**: This codebase has been systematically optimized with legacy component removal, duplicate code elimination, and modern React patterns implementation for improved maintainability.

## 🌟 Features

- **Pure Client-Side**: No backend server required - runs entirely in the browser
- **Three Quiz Categories**: Movies, Social Media, and Influencers
- **Interactive UI**: Modern design with smooth animations using Framer Motion
- **Reward System**: Earn coins for correct answers and track your progress
- **Responsive Design**: Works perfectly on mobile and desktop
- **Local Storage**: All user data and progress saved locally in the browser
- **Guest Mode**: Start playing immediately without registration

## 🌐 Automated Deployment to Hostinger

This project includes **automated GitHub Actions deployment** to Hostinger hosting. Deploy with just a few clicks!

### 🚀 Quick Deployment Setup:

1. **Fork this repository** to your GitHub account

2. **Configure GitHub Secrets** in your repository:
   - Go to Settings → Secrets and variables → Actions
   - Add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `FTP_HOST` | Hostinger FTP host | `your-domain.com` |
| `FTP_USERNAME` | FTP username | `u123456789` |
| `FTP_PASSWORD` | FTP password | `your-password` |
| `APP_URL` | Your website URL | `https://your-domain.com` |
| `APP_DOMAIN` | Domain name | `your-domain.com` |
| `ANALYTICS_ID` | Google Analytics ID | `G-XXXXXXXXXX` |
| `ADSENSE_PUBLISHER_ID` | AdSense Publisher ID | `ca-pub-1234567890123456` |

3. **Trigger Deployment**:
   - Go to Actions tab → "Deploy TechKwiz-v7 to Hostinger"
   - Click "Run workflow"
   - Your site will be live in 3-5 minutes! 🎉

📖 **Detailed deployment guide**: [GITHUB_DEPLOYMENT_GUIDE.md](frontend/GITHUB_DEPLOYMENT_GUIDE.md)

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Techkwiz-v7
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Alternative: Use the startup script
```bash
./start_frontend.sh
```

## 🎮 How to Play

1. **Start**: Visit the homepage and click "Start Quiz"
2. **Choose Category**: Select from Movies, Social Media, or Influencers
3. **Answer Questions**: You have 30 seconds per question
4. **Earn Coins**: Get 25 coins for each correct answer
5. **Track Progress**: View your stats and quiz history

## 🏗️ Architecture

This is a **client-side only** application built with:

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Data Storage**: Browser localStorage/sessionStorage
- **State Management**: React Context API

### Key Components

- `frontend/src/data/quizDatabase.ts` - All quiz questions and categories
- `frontend/src/utils/auth.ts` - Client-side authentication and user management
- `frontend/src/components/` - Reusable UI components
- `frontend/src/app/` - Next.js app router pages

## 📝 Adding New Questions

Edit `frontend/src/data/quizDatabase.ts` to add new questions:

```typescript
{
  id: 'unique-id',
  question: 'Your question here?',
  options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
  correct_answer: 0, // Index of correct option
  difficulty: 'beginner', // 'beginner' | 'intermediate' | 'advanced'
  fun_fact: 'Interesting fact about the answer',
  category: 'movies', // 'movies' | 'social-media' | 'influencers'
  subcategory: 'Disney'
}
```

## 🚀 Deployment

Since this is a client-side only application, you can deploy it to any static hosting service:

### Vercel (Recommended)
```bash
npm run build
npx vercel --prod
```

### Netlify
```bash
npm run build
# Upload the 'out' folder to Netlify
```

### GitHub Pages
```bash
npm run build
# Push the 'out' folder to gh-pages branch
```

## 🔧 Configuration

### Quiz Settings
Edit `frontend/src/data/quizDatabase.ts` to modify:
- Timer duration (default: 30 seconds)
- Coins per correct answer (default: 25)
- Number of questions per quiz (default: 5)

### Styling
- Colors and themes: `frontend/tailwind.config.js`
- Global styles: `frontend/src/app/globals.css`

## 📱 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the browser console for errors
2. Clear browser cache and localStorage
3. Ensure you're using a supported browser
4. Create an issue on GitHub with details
