# 🔧 TechKwiz Admin Dashboard Guide

Complete guide for managing the TechKwiz quiz application through the admin dashboard.

## 🔐 Admin Access

### Authentication

**Admin URL**: `http://localhost:3001/jaseem` (Development) | `https://your-domain.com/jaseem` (Production)  
**Admin Password**: `TechKwiz2024!Admin`

### Login Process

1. Navigate to the admin URL
2. Enter the admin password: `TechKwiz2024!Admin`
3. Click "Access Admin Panel"
4. You'll be redirected to the admin dashboard

### Security Notes

- Password is case-sensitive
- Admin session persists until logout or browser close
- Use HTTPS in production for security
- Change default password for production deployments

## 🎯 Admin Dashboard Overview

### Layout Features

#### Desktop Experience (1024px+)
- **Collapsible Sidebar**: Toggle between full (384px) and compact (64px) modes
- **Full-Width Content**: Optimized for desktop screens
- **Smooth Animations**: Professional transitions and interactions
- **Icon Navigation**: Compact mode shows icons only with centered alignment

#### Mobile Experience (< 1024px)
- **Slide-in Drawer**: Touch-friendly navigation
- **Backdrop Overlay**: Intuitive mobile interactions
- **Responsive Design**: Optimized for mobile screens

#### TechKwiz Design Language
- **Glass Effects**: Modern UI with backdrop blur
- **Orange/Blue Theme**: Consistent brand colors
- **Gradient Backgrounds**: Dynamic visual elements
- **Professional Typography**: Clear, readable interface

## 📊 Dashboard Section

### Overview Statistics
- **Total Questions**: Current question count across all categories
- **Active Users**: Real-time user engagement metrics
- **Quizzes Completed**: Total completion statistics
- **Coins Awarded**: Reward system metrics
- **Average Score**: Performance analytics
- **Completion Rate**: User engagement rates

### Quick Actions
- **Add New Question**: Direct access to question creation
- **Configure Rewards**: Quick reward system adjustments
- **View Analytics**: Performance monitoring shortcuts
- **Export Data**: Data management tools

### System Status
- **Quiz Database**: Database connectivity status
- **User Sessions**: Active session monitoring
- **Reward System**: Reward processing status
- **Analytics Engine**: Tracking system health

## 🎯 Quiz Management

### Question Management

#### Adding Questions
1. Click "Add Question" button
2. Fill in question details:
   - **Question Text**: Clear, engaging question with emojis
   - **Category**: Select from available categories
   - **Difficulty**: Beginner, Intermediate, or Advanced
   - **Options**: Four multiple-choice answers
   - **Correct Answer**: Mark the correct option
3. Preview question before saving
4. Save to add to question database

#### Editing Questions
1. Use search/filter to find specific questions
2. Click "Edit" button on question row
3. Modify question details in modal
4. Preview changes
5. Save updates

#### Bulk Operations
- **Import CSV**: Upload questions via CSV file
- **Export CSV**: Download questions for backup/editing
- **Select All**: Bulk select for mass operations
- **Delete Selected**: Remove multiple questions

### Category Management
- **Movies**: Film industry, actors, directors, cinema trivia
- **Social Media**: Platforms, trends, digital culture
- **Influencers**: Content creators, personalities, celebrities
- **Gaming**: Video games, esports, gaming culture
- **Music**: Artists, songs, music industry
- **Travel**: Geography, landmarks, world knowledge
- **Food**: Cuisine, cooking, culinary culture
- **Animals**: Wildlife, pets, animal facts
- **Facts**: Interesting trivia and general knowledge

### Search & Filtering
- **Text Search**: Find questions by content
- **Category Filter**: Filter by specific categories
- **Difficulty Filter**: Filter by difficulty level
- **Combined Filters**: Use multiple filters simultaneously

## 🏆 Reward Configuration

### Popup Timing Settings
- **Delay Before First Popup**: Initial delay in seconds (default: 30)
- **Frequency Between Popups**: Questions between popups (default: 3)
- **Maximum Popups Per Session**: Session limit (default: 5)

### Reward Amounts
- **Correct Answer Coins**: Reward for correct answers (default: 50)
- **Incorrect Answer Coins**: Consolation reward (default: 10)
- **Streak Multiplier**: Bonus for consecutive correct answers (default: 1.5x)
- **Perfect Score Bonus**: Bonus for 100% completion (default: 100)

### Trigger Conditions
- **Score Threshold**: Minimum score percentage to trigger rewards (default: 70%)
- **Minimum Time Spent**: Required engagement time in seconds (default: 60)
- **Minimum Questions Answered**: Required question count (default: 3)

### Visual Settings
- **Animation Speed**: Treasure chest animation speed (1x - 3x)
- **Popup Size**: Small, Medium, or Large display size
- **Position**: Center, Top, or Bottom screen position
- **Color Scheme**: Blue, Purple, Green, or Gold themes

### A/B Testing
- **Enable A/B Testing**: Toggle for reward optimization testing
- **Test Variations**: Configure different reward strategies
- **Performance Tracking**: Monitor conversion rates

## 📈 Analytics & Integrations

### Google Analytics 4
- **Configuration**: Set up GA4 tracking
- **Event Tracking**: Monitor user interactions
- **Conversion Goals**: Track quiz completions
- **Real-time Monitoring**: Live user activity

### Google Tag Manager
- **Container Setup**: Configure GTM integration
- **Tag Management**: Manage tracking tags
- **Trigger Configuration**: Set up event triggers
- **Debug Mode**: Test tag functionality

### AdSense Integration
- **Publisher Configuration**: Set up AdSense account
- **Ad Placement**: Configure ad positions
- **Revenue Tracking**: Monitor ad performance
- **Optimization**: A/B test ad placements

### Custom Tracking
- **Custom Events**: Add specific tracking events
- **Conversion Funnels**: Track user journey
- **Performance Metrics**: Monitor Core Web Vitals
- **Error Tracking**: Monitor application errors

## ⚙️ System Settings

### Environment Configuration
- **Application Settings**: Core app configuration
- **Feature Toggles**: Enable/disable features
- **Performance Settings**: Optimization controls
- **Debug Options**: Development tools

### Security Settings
- **Authentication**: Admin access controls
- **Session Management**: Login session settings
- **Access Permissions**: User role management
- **Audit Logging**: Track admin activities

### Backup & Recovery
- **Data Export**: Backup quiz data and settings
- **Configuration Backup**: Save admin configurations
- **Restore Options**: Recovery procedures
- **Version Control**: Track configuration changes

## 🛠️ Troubleshooting

### Common Issues

#### Sidebar Not Collapsing
**Problem**: Desktop sidebar doesn't respond to collapse button  
**Solution**: 
1. Verify screen width is 1024px+ (lg breakpoint)
2. Check browser console for JavaScript errors
3. Refresh page and try again
4. Test on different browsers

#### Section Navigation Not Working
**Problem**: Admin sections don't switch content  
**Solution**:
1. Check browser console for React errors
2. Verify all components are loaded
3. Clear browser cache
4. Reload admin panel

#### Authentication Issues
**Problem**: Correct password rejected  
**Solution**:
1. Verify password: `TechKwiz2024!Admin` (case-sensitive)
2. Clear browser cookies
3. Try incognito/private mode
4. Check environment variables

#### Performance Issues
**Problem**: Admin panel loads slowly  
**Solution**:
1. Check network connection
2. Clear browser cache
3. Disable browser extensions
4. Monitor browser console for errors

### Getting Help

- **Browser Console**: Check for error messages
- **Network Tab**: Monitor API requests
- **Documentation**: Review this guide and README files
- **GitHub Issues**: Report bugs and feature requests

## 📞 Support

For additional support:
1. Check browser console for error messages
2. Review environment variable configuration
3. Verify all dependencies are installed
4. Test on different browsers/devices
5. Report issues with detailed error information

---

**🚀 Ready to manage your quiz?** Access the admin panel at the URL above with password `TechKwiz2024!Admin`
