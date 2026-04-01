# 📇 vCard QR Studio

A powerful web-based tool to generate dynamic vCard QR codes with **logo overlay**, **live editing**, and **full contact management**. Perfect for business cards, networking events, or personal use.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

![Preview](https://almamunhossen.github.io/vCard-QR-Studio/)

## ✨ Features

- ✅ **Complete vCard 3.0 support** – name, organization, title, multiple phones, fax, email, website, WeChat, address, maps
- 📱 **Mobile Other (2)** – add a secondary mobile number
- 📞 **Phone work extension** – include extension with work number
- 🌐 **Smart social links** – auto-format WhatsApp, Facebook, X, YouTube, Instagram, LinkedIn (username or URL)
- 🖼️ **Logo overlay** – upload PNG, JPG, or SVG; adjust size (30–90px); remove background behind logo
- ✏️ **Live vCard editor** – edit raw vCard text; QR updates instantly
- 🌓 **Dark / Light mode** – theme preference saved locally
- 📥 **Export options** – download QR as **SVG** (vector) or **PNG** (raster); download **.vcf** file
- 📶 **WiFi network** – include SSID, password, encryption in vCard notes
- 📱 **Fully responsive** – works on desktop, tablet, and mobile

## 🚀 Quick Start

1. Download the `index.html` file.
2. Open it in any modern browser (Chrome, Firefox, Safari, Edge).
3. Fill in your contact details → QR code updates automatically.
4. Optionally upload a logo and adjust settings.
5. Download your QR code as SVG/PNG or save the `.vcf` file.

No server or installation required – runs entirely client-side.

## 📖 How to Use

### 1️⃣ Fill in your details

Use the left panel to enter:
- Personal & Work: Full name, organization, job title
- Phone & Fax: Work (with extension), private, mobile, mobile other (2), fax
- Digital Profiles: Email, website, WeChat ID
- Social Links: Enter username or full URL (smart formatting applied)
- Location: Office address, Google Maps URL
- WiFi: SSID, password, encryption (optional)

### 2️⃣ Watch the QR update

The right panel shows the live vCard and QR code. Every change updates both instantly.

### 3️⃣ Add a logo (optional)

- Click the dropzone or drag & drop an image.
- Adjust logo size with the slider.
- Check *"Remove QR Background Behind Logo"* to add a white backing.

### 4️⃣ Export

- **SVG** – vector format, perfect for print (scales infinitely)
- **PNG** – raster format, good for web
- **.vcf** – vCard file, import directly into phone contacts

### 5️⃣ Edit vCard directly

The textarea on the right contains the raw vCard. Edit any line and the form fields will sync automatically.

## 🧠 Smart Social Link Examples

| Platform | You type | Auto-converts to |
|----------|----------|------------------|
| WhatsApp | `+880146177621` | `https://wa.me/966546177621` |
| Facebook | `john.doe` | `https://facebook.com/john.doe` |
| X (Twitter) | `@username` | `https://x.com/username` |
| YouTube | `@mychannel` | `https://youtube.com/@mychannel` |
| Instagram | `jane_doe` | `https://instagram.com/jane_doe` |
| LinkedIn | `john-doe` | `https://linkedin.com/in/john-doe` |

If you enter a full URL (starting with `http://` or `https://`), it is used as-is.

## 🧪 Supported vCard Fields

| Field | vCard Property |
|-------|----------------|
| Full Name | `FN`, `N` |
| Organization | `ORG` |
| Job Title | `TITLE` |
| Phone (Work) + Extension | `TEL;TYPE=WORK,VOICE` |
| Phone (Private) | `TEL;TYPE=HOME,VOICE` |
| Phone (Mobile) | `TEL;TYPE=CELL,VOICE` |
| Mobile Other (2) | second `TEL;TYPE=CELL,VOICE` |
| Fax (Private) | `TEL;TYPE=HOME,FAX` |
| Email | `EMAIL;TYPE=WORK,INTERNET` |
| Website | `URL;TYPE=WORK` |
| WeChat ID | `IMPP:weixin://dl/chat?...` + `NOTE` |
| Social links | `URL;TYPE=WhatsApp`, `URL;TYPE=Facebook`, etc. |
| Address | `ADR;TYPE=WORK` |
| Google Maps | `URL;TYPE=Map` |
| WiFi details | added to `NOTE` |

## 🎨 Customization

You can modify the default QR code colors by editing the CSS variables in the `<style>` block:

```css
/* Default dark module color */
svg rect[fill="#1a3e4c"]

/* Default light background */
svg rect[fill="#FFFFFF"]


