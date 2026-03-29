    // Helper: clean phone numbers
    function cleanPhone(p) { if(!p) return ""; return p.replace(/[\s\-]/g, ''); }
    
    // Smart URL builder for socials
    function buildSocialUrl(input, type) {
        if (!input) return "";
        input = input.trim();
        if (input.startsWith("http://") || input.startsWith("https://")) return input;
        switch(type) {
            case 'whatsapp':
                let phone = input.replace(/[^0-9+]/g, '');
                if (phone.startsWith('+')) return `https://wa.me/${phone.substring(1)}`;
                return `https://wa.me/${phone.replace(/^00/, '')}`;
            case 'facebook': return `https://facebook.com/${input.replace(/^@/, '')}`;
            case 'twitter': return `https://x.com/${input.replace(/^@/, '')}`;
            case 'youtube': return input.startsWith('@') ? `https://youtube.com/${input}` : `https://youtube.com/@${input}`;
            case 'instagram': return `https://instagram.com/${input.replace(/^@/, '')}`;
            case 'linkedin': return input.includes('/in/') ? input : `https://linkedin.com/in/${input}`;
            default: return input;
        }
    }
    
    function getSocialUrls() {
        return {
            whatsapp: buildSocialUrl(document.getElementById('whatsappInput').value, 'whatsapp'),
            facebook: buildSocialUrl(document.getElementById('facebookInput').value, 'facebook'),
            twitter: buildSocialUrl(document.getElementById('xInput').value, 'twitter'),
            youtube: buildSocialUrl(document.getElementById('youtubeInput').value, 'youtube'),
            instagram: buildSocialUrl(document.getElementById('instagramInput').value, 'instagram'),
            linkedin: buildSocialUrl(document.getElementById('linkedinInput').value, 'linkedin')
        };
    }
    
    function getWifiNote() {
        let ssid = document.getElementById('wifiSsid').value.trim();
        let pass = document.getElementById('wifiPassword').value.trim();
        let enc = document.getElementById('wifiEncryption').value;
        if(!ssid) return "";
        if(enc === "nopass") return `WiFi: "${ssid}" (Open)`;
        return `WiFi: "${ssid}" | Password: ${pass} | Encryption: ${enc}`;
    }
    
    function buildVCardFromForm() {
        const fullName = document.getElementById('fullName').value.trim();
        const jobTitle = document.getElementById('jobTitle').value.trim();
        const org = document.getElementById('organization').value.trim();
        let phoneWork = document.getElementById('phoneWork').value.trim();
        const phoneWorkExt = document.getElementById('phoneWorkExt').value.trim();
        if (phoneWork && phoneWorkExt) phoneWork += ` ext ${phoneWorkExt}`;
        const phonePrivate = document.getElementById('phonePrivate').value.trim();
        const phoneMobile = document.getElementById('phoneMobile').value.trim();
        const phoneMobileOther = document.getElementById('phoneMobileOther').value.trim();
        const faxPrivate = document.getElementById('faxPrivate').value.trim();
        const email = document.getElementById('email').value.trim();
        const website = document.getElementById('website').value.trim();
        const wechatId = document.getElementById('wechatId').value.trim();
        const address = document.getElementById('address').value.trim();
        const mapsUrl = document.getElementById('mapsUrl').value.trim();
        const wifiNote = getWifiNote();
        const socials = getSocialUrls();
        
        let vc = "BEGIN:VCARD\r\nVERSION:3.0\r\n";
        if(fullName) vc += `N:;${fullName.replace(/;/g,',')};;;\r\nFN:${fullName}\r\n`;
        else vc += `FN:Contact\r\n`;
        if(org) vc += `ORG:${org}\r\n`;
        if(jobTitle) vc += `TITLE:${jobTitle}\r\n`;
        if(phoneWork) vc += `TEL;TYPE=WORK,VOICE:${cleanPhone(phoneWork)}\r\n`;
        if(phonePrivate) vc += `TEL;TYPE=HOME,VOICE:${cleanPhone(phonePrivate)}\r\n`;
        if(phoneMobile) vc += `TEL;TYPE=CELL,VOICE:${cleanPhone(phoneMobile)}\r\n`;
        if(phoneMobileOther) vc += `TEL;TYPE=CELL,VOICE:${cleanPhone(phoneMobileOther)}\r\n`; // Mobile Other (2)
        if(faxPrivate) vc += `TEL;TYPE=HOME,FAX:${cleanPhone(faxPrivate)}\r\n`;
        if(email) vc += `EMAIL;TYPE=WORK,INTERNET:${email}\r\n`;
        if(website) vc += `URL;TYPE=WORK:${website}\r\n`;
        if(wechatId) vc += `IMPP:weixin://dl/chat?${wechatId}\r\n`;
        if(socials.whatsapp) vc += `URL;TYPE=WhatsApp:${socials.whatsapp}\r\n`;
        if(socials.facebook) vc += `URL;TYPE=Facebook:${socials.facebook}\r\n`;
        if(socials.twitter) vc += `URL;TYPE=X:${socials.twitter}\r\n`;
        if(socials.youtube) vc += `URL;TYPE=YouTube:${socials.youtube}\r\n`;
        if(socials.instagram) vc += `URL;TYPE=Instagram:${socials.instagram}\r\n`;
        if(socials.linkedin) vc += `URL;TYPE=LinkedIn:${socials.linkedin}\r\n`;
        if(address) vc += `ADR;TYPE=WORK:;;${address.replace(/,/g, ';')};;;;\r\n`;
        if(mapsUrl) vc += `URL;TYPE=Map:${mapsUrl}\r\n`;
        let notes = [];
        if(wechatId) notes.push(`WeChat: ${wechatId}`);
        if(wifiNote) notes.push(wifiNote);
        if(address) notes.push(`Office: ${address}`);
        if(notes.length) vc += `NOTE:${notes.join(" | ")}\r\n`;
        // REV line removed as requested
        vc += "END:VCARD\r\n";
        return vc;
    }
    
    // Generate base QR SVG
    function generateBaseQRSvg(vcardText, size = 220) {
        let qr = qrcode(0, 'M');
        qr.addData(vcardText);
        qr.make();
        let cellSize = size / qr.getModuleCount();
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">`;
        svg += `<rect width="${size}" height="${size}" fill="#FFFFFF"/>`;
        for (let row = 0; row < qr.getModuleCount(); row++) {
            for (let col = 0; col < qr.getModuleCount(); col++) {
                if (qr.isDark(row, col)) {
                    let x = col * cellSize;
                    let y = row * cellSize;
                    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#1a3e4c" />`;
                }
            }
        }
        svg += `</svg>`;
        return svg;
    }
    
    let currentLogoDataURL = null;
    function renderQRWithLogo() {
        const vcardText = document.getElementById('vcardTextarea').value;
        if (!vcardText.startsWith("BEGIN:VCARD")) return;
        
        let finalSvg = generateBaseQRSvg(vcardText, 220);
        
        if (currentLogoDataURL) {
            const logoSize = parseInt(document.getElementById('logoSize').value);
            const eraseBg = document.getElementById('eraseBehindLogo').checked;
            const qrSize = 220;
            const logoX = (qrSize - logoSize) / 2;
            const logoY = (qrSize - logoSize) / 2;
            
            if (eraseBg) {
                finalSvg = finalSvg.replace('</svg>', `<rect x="${logoX-2}" y="${logoY-2}" width="${logoSize+4}" height="${logoSize+4}" fill="#FFFFFF" rx="8" /><image href="${currentLogoDataURL}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" />\n</svg>`);
            } else {
                finalSvg = finalSvg.replace('</svg>', `<image href="${currentLogoDataURL}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" />\n</svg>`);
            }
        }
        
        const container = document.getElementById('svgQrContainer');
        const oldSvg = container.querySelector('svg');
        const newSvg = new DOMParser().parseFromString(finalSvg, 'image/svg+xml').documentElement;
        newSvg.setAttribute('class', 'qr-svg');
        newSvg.setAttribute('id', 'dynamicQRsvg');
        if (oldSvg) container.replaceChild(newSvg, oldSvg);
        else container.appendChild(newSvg);
        
        // Update hidden canvas for PNG fallback
        const canvas = document.getElementById('hiddenCanvasQR');
        if(canvas) {
            QRCode.toCanvas(canvas, vcardText, { width: 400, margin: 2, color: { dark: '#1a3e4c', light: '#FFFFFF' } }, (err) => { if(err) console.error(err); });
        }
    }
    
    // Sync form to textarea
    let isUpdatingFromTextarea = false;
    function syncFormToTextarea() {
        const vcard = buildVCardFromForm();
        const textarea = document.getElementById('vcardTextarea');
        if (textarea && !isUpdatingFromTextarea) {
            textarea.value = vcard;
        }
        renderQRWithLogo();
    }
    
    function syncFormFromVCard(vcardText) {
        try {
            let fnMatch = vcardText.match(/FN:(.+?)(?:\r?\n|$)/);
            if(fnMatch) document.getElementById('fullName').value = fnMatch[1].trim();
            let titleMatch = vcardText.match(/TITLE:(.+?)(?:\r?\n|$)/);
            if(titleMatch) document.getElementById('jobTitle').value = titleMatch[1].trim();
            let orgMatch = vcardText.match(/ORG:(.+?)(?:\r?\n|$)/);
            if(orgMatch) document.getElementById('organization').value = orgMatch[1].trim();
            let emailMatch = vcardText.match(/EMAIL.*?:(.+?)(?:\r?\n|$)/);
            if(emailMatch) document.getElementById('email').value = emailMatch[1].trim();
            let webMatch = vcardText.match(/URL;TYPE=WORK:(.+?)(?:\r?\n|$)/);
            if(webMatch) document.getElementById('website').value = webMatch[1].trim();
            let mobileMatch = vcardText.match(/TEL;TYPE=CELL,VOICE:(.+?)(?:\r?\n|$)/);
            if(mobileMatch) document.getElementById('phoneMobile').value = mobileMatch[1].trim();
            // Extract second mobile if exists (simple pattern)
            let mobileMatches = [...vcardText.matchAll(/TEL;TYPE=CELL,VOICE:(.+?)(?:\r?\n|$)/g)];
            if(mobileMatches.length >= 2) {
                document.getElementById('phoneMobileOther').value = mobileMatches[1][1].trim();
            }
        } catch(e) {}
        syncFormToTextarea();
    }
    
    function onTextareaEdit() {
        const edited = document.getElementById('vcardTextarea').value;
        if(edited.trim().startsWith("BEGIN:VCARD")) {
            isUpdatingFromTextarea = true;
            syncFormFromVCard(edited);
            isUpdatingFromTextarea = false;
            renderQRWithLogo();
        }
    }
    
    // Modern logo upload handlers
    const dropzone = document.getElementById('logoDropzone');
    const fileInput = document.getElementById('logoFileInput');
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#ff8c42'; });
    dropzone.addEventListener('dragleave', () => dropzone.style.borderColor = 'var(--input-border)');
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleLogoFile(file);
        dropzone.style.borderColor = 'var(--input-border)';
    });
    fileInput.addEventListener('change', (e) => { if(e.target.files[0]) handleLogoFile(e.target.files[0]); });
    
    function handleLogoFile(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            currentLogoDataURL = ev.target.result;
            document.getElementById('logoThumb').src = currentLogoDataURL;
            document.getElementById('logoPreviewModern').style.display = 'flex';
            document.getElementById('logoStatus').innerHTML = 'Logo loaded';
            renderQRWithLogo();
        };
        reader.readAsDataURL(file);
    }
    
    document.getElementById('logoSize').addEventListener('input', (e) => {
        document.getElementById('logoSizeValue').innerText = e.target.value + 'px';
        if(currentLogoDataURL) renderQRWithLogo();
    });
    document.getElementById('eraseBehindLogo').addEventListener('change', () => {
        if(currentLogoDataURL) renderQRWithLogo();
    });
    
    // Downloads
    function downloadSVG() {
        const svgElem = document.getElementById('dynamicQRsvg');
        const serializer = new XMLSerializer();
        const source = serializer.serializeToString(svgElem);
        const blob = new Blob([source], {type: 'image/svg+xml'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'vcard_qr_logo.svg';
        a.click();
        URL.revokeObjectURL(a.href);
    }
    
    function downloadPNG() {
        const svgElem = document.getElementById('dynamicQRsvg');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svgElem);
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const a = document.createElement('a');
            a.download = 'vcard_qr_logo.png';
            a.href = canvas.toDataURL('image/png');
            a.click();
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
    }
    
    function downloadVCF() {
        const vcard = document.getElementById('vcardTextarea').value;
        const blob = new Blob([vcard], {type: 'text/vcard'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'contact.vcf';
        a.click();
        URL.revokeObjectURL(a.href);
    }
    
    // Theme
    function initTheme() {
        const saved = localStorage.getItem('theme');
        if(saved === 'dark') document.body.classList.add('dark');
        document.getElementById('themeToggle').addEventListener('click', () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        });
    }
    
    // Setup
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        const allInputs = document.querySelectorAll('#mainForm input, #mainForm select');
        allInputs.forEach(el => el.addEventListener('input', () => syncFormToTextarea()));
        document.getElementById('manualUpdateBtn').addEventListener('click', () => syncFormToTextarea());
        const textarea = document.getElementById('vcardTextarea');
        textarea.addEventListener('input', onTextareaEdit);
        document.getElementById('downloadSvgBtn').addEventListener('click', downloadSVG);
        document.getElementById('downloadPngBtn').addEventListener('click', downloadPNG);
        document.getElementById('downloadVcfBtn').addEventListener('click', downloadVCF);
        syncFormToTextarea();
        // Hidden canvas for fallback
        const hiddenCanvas = document.createElement('canvas');
        hiddenCanvas.id = 'hiddenCanvasQR';
        hiddenCanvas.style.display = 'none';
        document.body.appendChild(hiddenCanvas);
    });