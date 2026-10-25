# Hostinger Deployment Guide for SMIS Frontend

This guide explains step-by-step how to deploy the SMIS (Slaughterhouse Management Information System) React frontend to **Hostinger** (Shared Hosting, Cloud Hosting, or VPS).

---

## 📋 What Has Been Prepared for You

1. **SPA Routing Support (`.htaccess`)**:
   - React Router uses HTML5 `BrowserRouter`. On Hostinger's Apache/LiteSpeed servers, refreshing any subroute (e.g., `/login`, `/dashboard`, `/inventory`) without an `.htaccess` file would cause a **404 Not Found** error.
   - An optimized `.htaccess` is located in `public/.htaccess` and is automatically included in `dist/` every time you run `npm run build`.
   - It also configures **Gzip compression**, **browser caching** for hashed assets, and **security headers**.

2. **Environment Variable Configuration (`.env.production` & `.env.example`)**:
   - `VITE_API_BASE_URL`: Allows you to point the frontend to your live production backend API (e.g., `https://api.yourdomain.com/api` or VPS IP).

3. **Dynamic Image & Avatar Resolution (`src/utils/urlHelper.js`)**:
   - Avatars and uploaded meat product photos no longer have hardcoded `localhost:5000` URLs. They now dynamically resolve using the configured `VITE_API_BASE_URL`.

4. **Production Bundle Optimization (`vite.config.js`)**:
   - Vendor code splitting (`react-vendor`, `chartjs-vendor`, `axios-vendor`, `icons-vendor`) for fast initial page load and caching.

---

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Backend API URL (Already Configured!)

Your `.env.production` has already been configured with your live Render backend:

```env
VITE_API_BASE_URL=https://smis-server-zilm.onrender.com/api
```

---

### Step 2: Build the Production Bundle

To build or update the production bundle and ZIP file in one step, simply run:

```bash
npm run build:zip
```

This compiles your application into `dist/` and automatically packages all files into **`dist.zip`** ready for immediate upload to Hostinger!

---

### Step 3: Deploy to Hostinger via File Manager (1-Click Upload)

1. **Locate your ready-to-upload ZIP file**:
   - Your package is already prepared at:
     `c:\Users\Jade\Documents\SMIS\frontend\dist.zip`
   - It contains `.htaccess`, `index.html`, `assets/`, and all public assets.

2. **Log in to Hostinger hPanel**:
   - Go to [hostinger.com](https://hostinger.com) and log into your **hPanel**.
   - Under **Websites**, click **Manage** next to your domain.

3. **Open File Manager**:
   - In the left sidebar, click **Files** -> **File Manager** -> **Access files of [your domain]**.
   - Open the **`public_html`** directory.

4. **Upload and Extract**:
   - If there is a default placeholder file (`default.php`), delete or rename it.
   - Click the **Upload** button (arrow pointing up at top right) and upload **`dist.zip`**.
   - Right-click `dist.zip` inside File Manager and click **Extract**.
   - Choose the current folder (`public_html`) and confirm **Extract**.
   - Delete `dist.zip` once extracted.

5. **Verify File Placement**:
   Your `public_html/` folder should look like this:
   ```
   public_html/
   ├── .htaccess
   ├── index.html
   ├── assets/
   │   ├── index-*.css
   │   ├── index-*.js
   │   └── ...
   ├── favicon.ico
   ├── logo.svg
   └── ...
   ```
   > ⚠️ Make sure `.htaccess` is present in `public_html`. In Hostinger File Manager, hidden dotfiles are displayed by default. If not visible, check File Manager settings to enable "Show hidden files".

---

### Step 4: Alternative: Deploy via FTP (FileZilla)

If you prefer FTP:
1. In Hostinger hPanel, go to **Files** -> **FTP Accounts** to get your FTP Hostname, Username, and Password.
2. Open FileZilla and connect to your Hostinger server.
3. In the remote pane, open `/public_html/`.
4. In the local pane, open `c:\Users\Jade\Documents\SMIS\frontend\dist\`.
5. Upload all files from `dist/` into `/public_html/`.

---

### Step 5: Enable SSL (HTTPS) on Hostinger

1. In hPanel, go to **Security** -> **SSL**.
2. If SSL is not active yet, install the free **Let's Encrypt SSL**.
3. Toggle ON **Force HTTPS** so all `http://` visitors are automatically redirected to `https://`.

---

## 🔍 Verification & Testing Checklist

Once uploaded, test the following:

- [ ] **Home / Landing Page**: Visit `https://yourdomain.com` — verify it loads with images and styling.
- [ ] **Direct Subroute / Refresh Test**: Visit `https://yourdomain.com/login` and press **F5 (Refresh)**.
  - If `.htaccess` is working properly, the login page will reload without a 404 error.
- [ ] **API Connectivity**: Open browser DevTools (`F12`) -> **Network** tab. Try logging in or fetching products:
  - Check that requests go to your live backend (e.g. `https://api.yourdomain.com/api/...`).
  - Verify that status code is `200` (or `401` if invalid credentials).
- [ ] **Uploaded Images**: Verify that meat cuts and avatar photos display properly from the server.
- [ ] **CORS**: If you see a `CORS error` in the console, verify your backend `server.js` has `app.use(cors())` enabled.

---

## 🛠️ Troubleshooting Common Hostinger Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **404 Not Found on page refresh** | Missing or inactive `.htaccess` in `public_html` | Ensure `.htaccess` exists in `public_html` with the `mod_rewrite` rules from this project. |
| **Blank white page** | Incorrect asset path or JS error | Open browser DevTools Console (`F12`) to check the error message. Ensure all files were uploaded to `public_html`. |
| **Network Error / Failed to fetch** | `VITE_API_BASE_URL` is pointing to `localhost` or invalid domain | Update `.env.production` with your real production API URL, rebuild with `npm run build`, and re-upload. |
| **Mixed Content Warning** | Frontend is on `https://` but backend is `http://` | Ensure backend has an SSL certificate (`https://`). Browsers block unencrypted HTTP requests from HTTPS sites. |
| **CORS Policy Error** | Backend does not permit Hostinger domain | Ensure your backend uses `app.use(cors())` or allows `https://yourdomain.com` in `Access-Control-Allow-Origin`. |
