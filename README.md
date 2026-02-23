# Arad Soft & VPN XO Website

Modern, responsive website for Arad Soft company and VPN XO service.

## Features

### Arad Soft Website (vpn-xo.com)
- Company homepage
- Services showcase
- Products section
- About and contact information

### VPN XO Platform (vpn-xo.com/vpnxo)
- Landing page with features and pricing
- User registration and login
- User dashboard with VPN connection management
- Subscription management
- App download page

## Technology Stack

- **React 18** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - API requests
- **React Icons** - Icon library
- **Framer Motion** - Animations

## Logo Usage

The website uses different VPN XO logo colors to indicate connection status:
- **Red** (`logo vpnxo red.png`) - Disconnected
- **Orange** (`logo vpnxo orange.png`) - Connecting
- **Green** (`logo vpnxo green.png`) - Connected
- **Original** (`logo vpnxo original.png`) - Default/Marketing

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Development

The app will run on `http://localhost:3000`

### Routes

**Arad Soft:**
- `/` - Homepage

**VPN XO:**
- `/vpnxo` - Landing page
- `/vpnxo/login` - Login
- `/vpnxo/register` - Registration
- `/vpnxo/dashboard` - User dashboard
- `/vpnxo/subscribe` - Subscription plans
- `/vpnxo/download` - App downloads

## API Configuration

The website connects to the VPN XO API at:
- **Production**: `http://51.222.9.219/api`

To change the API endpoint, update the axios calls in the page components.

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `build/` directory with optimized production files.

### Deploy to Canada Server

```bash
# Build the app
npm run build

# Upload to server
scp -r build/* ubuntu@51.222.9.219:/var/www/vpnxo/frontend/

# Configure nginx to serve the frontend
```

### nginx Configuration

Add to nginx config:

```nginx
server {
    listen 80;
    server_name vpn-xo.com www.vpn-xo.com;

    # Frontend
    location / {
        root /var/www/vpnxo/frontend;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        # ... proxy settings
    }
}
```

## Environment Variables

Create a `.env` file for environment-specific configuration:

```env
REACT_APP_API_URL=http://51.222.9.219/api
```

## Features by Page

### Dashboard
- Real-time VPN connection status
- Server selection (France/Canada)
- Protocol selection (Shadowsocks, Trojan, V2Ray, Hysteria)
- Connect/Disconnect functionality
- Account information
- Upgrade to premium option

### Subscription
- Monthly and yearly plans
- Feature comparison
- Secure payment integration (to be implemented)

### Download
- Windows app download
- Android APK download
- Installation instructions
- System requirements

## Color Scheme

**Arad Soft:**
- Primary: Blue (#1e40af)
- Secondary: Light Blue (#3b82f6)

**VPN XO:**
- Connected: Green (#10b981)
- Connecting: Orange (#f97316)
- Disconnected: Red (#ef4444)
- Primary: Blue (#3b82f6)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - Arad Soft Â© 2025

