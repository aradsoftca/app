# VPN XO Website - Quick Start Guide

## ðŸš€ Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn
- Access to the server (for deployment)

### Installation

1. **Navigate to the frontend directory**:
```bash
cd frontend-new
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm start
```

The website will open at `http://localhost:3000`

## ðŸ“ Project Structure

```
frontend-new/
â”œâ”€â”€ public/              # Static files
â”‚   â””â”€â”€ logos/          # Logo images
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/     # Reusable components
â”‚   â”‚   â”œâ”€â”€ common/    # Button, Card, Input
â”‚   â”‚   â”œâ”€â”€ layout/    # Header, Footer (future)
â”‚   â”‚   â””â”€â”€ features/  # Feature-specific components
â”‚   â”œâ”€â”€ hooks/         # Custom React hooks
â”‚   â”‚   â”œâ”€â”€ useAuth.js    # Authentication
â”‚   â”‚   â””â”€â”€ useVPN.js     # VPN management
â”‚   â”œâ”€â”€ pages/         # Page components
â”‚   â”‚   â”œâ”€â”€ VPNXOHomeEnhanced.js
â”‚   â”‚   â”œâ”€â”€ VPNXODashboardEnhanced.js
â”‚   â”‚   â”œâ”€â”€ VPNXOLoginEnhanced.js
â”‚   â”‚   â””â”€â”€ VPNXORegisterEnhanced.js
â”‚   â”œâ”€â”€ services/      # API services
â”‚   â”‚   â””â”€â”€ api.js    # API client
â”‚   â”œâ”€â”€ App.js        # Main app component
â”‚   â”œâ”€â”€ App.css       # Global styles
â”‚   â””â”€â”€ index.js      # Entry point
â”œâ”€â”€ package.json
â”œâ”€â”€ tailwind.config.js
â””â”€â”€ README.md
```

## ðŸŽ¨ Available Pages

### Enhanced Pages (Production)
- `/vpnxo` - Home page
- `/vpnxo/login` - Login page
- `/vpnxo/register` - Register page
- `/vpnxo/dashboard` - Dashboard (protected)
- `/vpnxo/subscribe` - Subscription page
- `/vpnxo/download` - Download page

### Legacy Pages (For Comparison)
- `/vpnxo/old` - Old home page
- `/vpnxo/login/old` - Old login
- `/vpnxo/register/old` - Old register
- `/vpnxo/dashboard/old` - Old dashboard

## ðŸ”§ Development

### Running Locally

```bash
# Start development server
npm start

# Build for production
npm run build

# Test production build
npx serve -s build
```

### Environment Variables

Create `.env` file:
```env
REACT_APP_API_URL=http://51.222.9.219/api
REACT_APP_ENV=development
```

For production:
```env
REACT_APP_API_URL=http://51.222.9.219/api
REACT_APP_ENV=production
```

## ðŸš¢ Deployment

### Option 1: Using Deployment Script (Recommended)

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Option 2: Manual Deployment

```bash
# Build the project
npm run build

# Copy to server
scp -r build/* ubuntu@51.222.9.219:/var/www/html/vpnxo/

# Set permissions
ssh ubuntu@51.222.9.219 "sudo chown -R www-data:www-data /var/www/html/vpnxo && sudo chmod -R 755 /var/www/html/vpnxo"
```

## ðŸ§ª Testing

### Test Authentication Flow
1. Go to `/vpnxo/register`
2. Create an account
3. Login at `/vpnxo/login`
4. Access dashboard at `/vpnxo/dashboard`

### Test VPN Connection
1. Login to dashboard
2. Select a server
3. Choose a protocol
4. Click "Connect to VPN"
5. Verify connection status
6. Click "Disconnect"

## ðŸ“ Common Tasks

### Adding a New Page

1. Create page component in `src/pages/`:
```javascript
import React from 'react';

const NewPage = () => {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
};

export default NewPage;
```

2. Add route in `App.js`:
```javascript
import NewPage from './pages/NewPage';

// In Routes:
<Route path="/vpnxo/new-page" element={<NewPage />} />
```

### Adding a New API Endpoint

1. Add to `src/services/api.js`:
```javascript
export const apiService = {
  // ... existing methods
  newEndpoint: (data) => api.post('/new-endpoint', data),
};
```

2. Use in component:
```javascript
import { apiService } from '../services/api';

const result = await apiService.newEndpoint(data);
```

### Creating a New Component

1. Create in `src/components/common/`:
```javascript
import React from 'react';

const NewComponent = ({ children, ...props }) => {
  return (
    <div {...props}>
      {children}
    </div>
  );
};

export default NewComponent;
```

2. Use in pages:
```javascript
import NewComponent from '../components/common/NewComponent';

<NewComponent>Content</NewComponent>
```

## ðŸ› Troubleshooting

### Build Errors

**Error**: `Module not found`
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error**: `Port 3000 already in use`
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 npm start
```

### API Connection Issues

**Error**: `Network Error` or `CORS Error`
- Check if backend is running: `http://51.222.9.219/health`
- Verify API URL in `.env`
- Check CORS settings in backend

**Error**: `401 Unauthorized`
- Token might be expired
- Try logging out and logging in again
- Check localStorage for `accessToken`

### Deployment Issues

**Error**: `Permission denied`
```bash
# Make deploy script executable
chmod +x deploy.sh
```

**Error**: `Connection refused`
- Verify server IP and credentials
- Check SSH access: `ssh ubuntu@51.222.9.219`
- Verify server password: `Muv-#222`

## ðŸ“š Resources

### Documentation
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [React Router](https://reactrouter.com)

### Project Files
- `WEBSITE_ENHANCEMENTS.md` - Detailed enhancement documentation
- `README.md` - Project overview
- Backend API docs in `../backend/`

## ðŸŽ¯ Next Steps

1. **Test Everything**:
   - All pages load correctly
   - Forms work properly
   - API calls succeed
   - Animations are smooth

2. **Deploy to Production**:
   - Run `./deploy.sh`
   - Test on live server
   - Monitor for errors

3. **Monitor Performance**:
   - Check page load times
   - Monitor API response times
   - Watch for errors in console

4. **Gather Feedback**:
   - Test with real users
   - Collect feedback
   - Iterate and improve

## ðŸ’¡ Tips

- Use React DevTools for debugging
- Check Network tab for API calls
- Use Lighthouse for performance audits
- Test on different devices and browsers
- Keep dependencies updated
- Follow the existing code patterns
- Write clean, readable code
- Comment complex logic
- Test before deploying

## ðŸ†˜ Support

Need help?
- Check `WEBSITE_ENHANCEMENTS.md` for detailed docs
- Review existing code for examples
- Contact: support@vpn-xo.com

---

**Happy Coding! ðŸš€**

