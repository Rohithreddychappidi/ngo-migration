# VPS Setup & Deployment Guide

## 1. Initial VPS Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

---

## 2. Upload & Run Backend

```bash
# On your local machine — zip and upload backend
scp -r ./backend user@YOUR_VPS_IP:/var/www/ngo-backend

# SSH into VPS
ssh user@YOUR_VPS_IP

# Install dependencies
cd /var/www/ngo-backend
npm install --production

# Create .env from example
cp .env.example .env
nano .env   # Fill in all values

# Create uploads directory
mkdir -p uploads/{causes,gallery,blog}

# Start with PM2
pm2 start server.js --name ngo-backend
pm2 save
pm2 startup   # Run the printed command to auto-start on reboot
```

---

## 3. Nginx Config (reverse proxy + serve uploads)

```bash
sudo nano /etc/nginx/sites-available/ngo-api
```

Paste this:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Proxy all requests to Express
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploads directly via Nginx (faster)
    location /uploads/ {
        alias /var/www/ngo-backend/uploads/;
        expires 7d;
        add_header Cache-Control "public";
        add_header Access-Control-Allow-Origin *;
    }

    # Max upload size
    client_max_body_size 15M;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ngo-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d api.yourdomain.com
```

---

## 4. NeonDB Setup

1. Go to https://neon.tech → Create account → New Project
2. Copy the **Connection String** (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
3. Open the **SQL Editor** in Neon dashboard
4. Paste and run the entire contents of `schema.sql`
5. Add connection string to `.env` as `DATABASE_URL`

---

## 5. Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create project → APIs & Services → Credentials
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add Authorized redirect URI: `https://api.yourdomain.com/auth/google/callback`
5. Add `http://localhost:5000/auth/google/callback` for local dev
6. Copy Client ID and Secret to `.env`

---

## 6. Frontend Environment Variables (Vercel)

Add to Vercel → Project → Settings → Environment Variables:

```
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_RAZORPAY_KEY=rzp_live_xxxx
```

Also add to your local `.env`:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY=rzp_test_xxxx
```

---

## 7. Frontend Auth Callback Route

Add this route to `App.js` so the OAuth redirect lands correctly:

```jsx
<Route path="/auth/callback" element={<PublicLayout><HomePage /></PublicLayout>} />
```

The `AuthContext` automatically reads the `?token=` param from this URL.

---

## 8. Make Yourself Admin

After first login, run this in NeonDB SQL editor:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 9. PM2 Commands (useful)

```bash
pm2 status              # Check if running
pm2 logs ngo-backend    # View logs
pm2 restart ngo-backend # Restart after code changes
pm2 stop ngo-backend    # Stop
```

---

## 10. Deploy Updates

```bash
# On local machine
scp -r ./backend user@YOUR_VPS_IP:/var/www/ngo-backend

# On VPS
cd /var/www/ngo-backend
npm install --production
pm2 restart ngo-backend
```
