let currentLogoDataURL = null;
    let currentCenterIconClass = null;
    let updateTimeout = null;
    let currentCrypto = 'bitcoin';
    
    // Font Awesome icon mapping to actual unicode characters and font families
    const iconMap = {
        'fas fa-address-card': { char: '\uf2bb', family: '"Font Awesome 6 Free"', weight: 900 },
        'fas fa-link': { char: '\uf0c1', family: '"Font Awesome 6 Free"', weight: 900 },
        'fab fa-bitcoin': { char: '\uf15a', family: '"Font Awesome 6 Brands"', weight: 400 },
        'fab fa-facebook': { char: '\uf09a', family: '"Font Awesome 6 Brands"', weight: 400 },
        'fab fa-twitter': { char: '\uf099', family: '"Font Awesome 6 Brands"', weight: 400 },
        'fab fa-youtube': { char: '\uf167', family: '"Font Awesome 6 Brands"', weight: 400 },
        'fab fa-instagram': { char: '\uf16d', family: '"Font Awesome 6 Brands"', weight: 400 },
        'fab fa-linkedin': { char: '\uf08c', family: '"Font Awesome 6 Brands"', weight: 400 },
        'fab fa-whatsapp': { char: '\uf232', family: '"Font Awesome 6 Brands"', weight: 400 },
        'fab fa-github': { char: '\uf09b', family: '"Font Awesome 6 Brands"', weight: 400 },
        'fab fa-behance': { char: '\uf1b4', family: '"Font Awesome 6 Brands"', weight: 400 },
        'fas fa-graduation-cap': { char: '\uf19d', family: '"Font Awesome 6 Free"', weight: 900 },
        'fas fa-paragraph': { char: '\uf1dd', family: '"Font Awesome 6 Free"', weight: 900 },
        'fas fa-envelope': { char: '\uf0e0', family: '"Font Awesome 6 Free"', weight: 900 },
        'fas fa-phone': { char: '\uf095', family: '"Font Awesome 6 Free"', weight: 900 },
        'fas fa-comment-dots': { char: '\uf27a', family: '"Font Awesome 6 Free"', weight: 900 },
        'fas fa-wifi': { char: '\uf1eb', family: '"Font Awesome 6 Free"', weight: 900 },
        'fas fa-map-marker-alt': { char: '\uf3c5', family: '"Font Awesome 6 Free"', weight: 900 },
        'fas fa-calendar-alt': { char: '\uf073', family: '"Font Awesome 6 Free"', weight: 900 }
    };
    
    // ========== ALL EXISTING FUNCTIONS (preserved) ==========
    async function searchAddress(address) {
        const statusDiv = document.getElementById('locationStatus');
        statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        try {
            const encodedAddress = encodeURIComponent(address);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                document.getElementById('latitude').value = lat.toFixed(6);
                document.getElementById('longitude').value = lon.toFixed(6);
                const mapIframe = document.getElementById('googleMapIframe');
                mapIframe.src = `https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed`;
                statusDiv.innerHTML = `<i class="fas fa-check-circle"></i> Found: ${data[0].display_name.substring(0, 80)}...`;
                updateQR();
            } else {
                statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Address not found.';
            }
        } catch (error) {
            statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error searching.';
        }
    }
    
    function updateMapFromCoordinates() {
        const lat = document.getElementById('latitude').value;
        const lng = document.getElementById('longitude').value;
        if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            const mapIframe = document.getElementById('googleMapIframe');
            mapIframe.src = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
        }
    }
    
    function setupCryptoSelector() {
        const options = document.querySelectorAll('.crypto-option');
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                const radio = opt.querySelector('input[type="radio"]');
                if (radio) { radio.checked = true; currentCrypto = radio.value; updateQR(); }
            });
            const radio = opt.querySelector('input[type="radio"]');
            if (radio) radio.addEventListener('change', (e) => { if(e.target.checked) { currentCrypto = e.target.value; updateQR(); } });
        });
    }
    
    function getCryptoURI() {
        const address = document.getElementById('cryptoAddress')?.value.trim();
        const amount = document.getElementById('cryptoAmount')?.value.trim();
        if (!address) return '';
        let uri = '';
        switch(currentCrypto) {
            case 'bitcoin': uri = `bitcoin:${address}`; break;
            case 'bitcoincash': uri = `bitcoincash:${address}`; break;
            case 'ethereum': uri = `ethereum:${address}`; break;
            case 'litecoin': uri = `litecoin:${address}`; break;
            case 'dash': uri = `dash:${address}`; break;
            default: uri = `bitcoin:${address}`;
        }
        if (amount && !isNaN(parseFloat(amount))) uri += `?amount=${parseFloat(amount)}`;
        return uri;
    }
    
    function renderQRWithLogoAndIcon(text) {
        if (!text || text === "") text = " ";
        const size = 220;
        let qr = qrcode(0, 'M');
        qr.addData(text);
        qr.make();
        const moduleCount = qr.getModuleCount();
        const cellSize = size / moduleCount;
        const qrDarkColor = getComputedStyle(document.body).getPropertyValue('--qr-dark-module').trim() || '#000000';
        
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">`;
        svg += `<rect width="${size}" height="${size}" fill="#FFFFFF"/>`;
        
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    let x = col * cellSize;
                    let y = row * cellSize;
                    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${qrDarkColor}" />`;
                }
            }
        }
        
        const centerX = size / 2;
        const centerY = size / 2;
        
        // Draw center icon if selected (using actual Font Awesome character)
        if (currentCenterIconClass && iconMap[currentCenterIconClass]) {
            const iconSizeVal = parseInt(document.getElementById('centerIconSize')?.value || 55);
            const eraseBg = document.getElementById('eraseBehindIcon')?.checked;
            const bgRadius = parseInt(document.getElementById('iconBgRadius')?.value || 12);
            const fontSize = iconSizeVal * 0.7;
            const iconInfo = iconMap[currentCenterIconClass];
            const iconChar = iconInfo.char;
            const fontFamily = iconInfo.family;
            const fontWeight = iconInfo.weight;
            
            const bgPadding = 8;
            const bgWidth = iconSizeVal + bgPadding * 2;
            const bgHeight = iconSizeVal + bgPadding * 2;
            const bgX = centerX - bgWidth/2;
            const bgY = centerY - bgHeight/2;
            
            if (eraseBg) {
                svg += `<rect x="${bgX}" y="${bgY}" width="${bgWidth}" height="${bgHeight}" fill="#FFFFFF" rx="${bgRadius}" />`;
            }
            // Fix: Use single quotes for font-family to avoid attribute value quoting issues
            svg += `<text x="${centerX}" y="${centerY + fontSize * 0.3}" text-anchor="middle" font-family='${fontFamily}' font-size="${fontSize}" fill="${qrDarkColor}" font-weight="${fontWeight}">${iconChar}</text>`;
        }
        
        // Draw logo on top if present
        if (currentLogoDataURL) {
            const logoSizeVal = parseInt(document.getElementById('logoSize')?.value || 55);
            const eraseBgLogo = document.getElementById('eraseBehindLogo')?.checked;
            const logoX = (size - logoSizeVal) / 2;
            const logoY = (size - logoSizeVal) / 2;
            if (eraseBgLogo) {
                svg += `<rect x="${logoX-2}" y="${logoY-2}" width="${logoSizeVal+4}" height="${logoSizeVal+4}" fill="#FFFFFF" rx="8" />`;
            }
            svg += `<image href="${currentLogoDataURL}" x="${logoX}" y="${logoY}" width="${logoSizeVal}" height="${logoSizeVal}" preserveAspectRatio="xMidYMid meet" />`;
        }
        
        svg += `</svg>`;
        
        const container = document.getElementById('svgQrContainer');
        if (!container) return;
        let oldSvg = container.querySelector('svg');
        const newSvg = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
        newSvg.setAttribute('class', 'qr-svg');
        newSvg.setAttribute('id', 'dynamicQRsvg');
        if (oldSvg) container.replaceChild(newSvg, oldSvg);
        else container.appendChild(newSvg);
    }
    
    function buildVCard() {
        const fullName = document.getElementById('fullName')?.value.trim() || '';
        const jobTitle = document.getElementById('jobTitle')?.value.trim() || '';
        const org = document.getElementById('organization')?.value.trim() || '';
        let phoneWork = document.getElementById('phoneWork')?.value.trim() || '';
        const ext = document.getElementById('phoneWorkExt')?.value.trim() || '';
        if (phoneWork && ext) phoneWork += ` ext ${ext}`;
        const phonePrivate = document.getElementById('phonePrivate')?.value.trim() || '';
        const phoneMobile = document.getElementById('phoneMobile')?.value.trim() || '';
        const phoneMobileOther = document.getElementById('phoneMobileOther')?.value.trim() || '';
        const fax = document.getElementById('faxPrivate')?.value.trim() || '';
        const email = document.getElementById('vcardEmail')?.value.trim() || '';
        const website = document.getElementById('vcardWebsite')?.value.trim() || '';
        const wechat = document.getElementById('wechatId')?.value.trim() || '';
        const address = document.getElementById('vcardAddress')?.value.trim() || '';
        const maps = document.getElementById('vcardMapsUrl')?.value.trim() || '';
        
        const getSocial = (id, type) => {
            let val = document.getElementById(id)?.value.trim() || '';
            if (!val) return '';
            if (val.startsWith('http')) return val;
            if (type === 'whatsapp') return `https://wa.me/${val.replace(/[^0-9+]/g, '')}`;
            if (type === 'facebook') return `https://facebook.com/${val.replace(/^@/, '')}`;
            if (type === 'twitter') return `https://x.com/${val.replace(/^@/, '')}`;
            if (type === 'youtube') return val.startsWith('@') ? `https://youtube.com/${val}` : `https://youtube.com/@${val}`;
            if (type === 'instagram') return `https://instagram.com/${val.replace(/^@/, '')}`;
            if (type === 'linkedin') return `https://linkedin.com/in/${val}`;
            return val;
        };
        
        let vc = "BEGIN:VCARD\r\nVERSION:3.0\r\n";
        vc += fullName ? `FN:${fullName}\r\nN:;${fullName};;;\r\n` : `FN:Contact\r\n`;
        if(org) vc += `ORG:${org}\r\n`;
        if(jobTitle) vc += `TITLE:${jobTitle}\r\n`;
        if(phoneWork) vc += `TEL;TYPE=WORK,VOICE:${phoneWork.replace(/\s/g, '')}\r\n`;
        if(phonePrivate) vc += `TEL;TYPE=HOME,VOICE:${phonePrivate.replace(/\s/g, '')}\r\n`;
        if(phoneMobile) vc += `TEL;TYPE=CELL,VOICE:${phoneMobile.replace(/\s/g, '')}\r\n`;
        if(phoneMobileOther) vc += `TEL;TYPE=CELL,VOICE:${phoneMobileOther.replace(/\s/g, '')}\r\n`;
        if(fax) vc += `TEL;TYPE=HOME,FAX:${fax.replace(/\s/g, '')}\r\n`;
        if(email) vc += `EMAIL;TYPE=WORK,INTERNET:${email}\r\n`;
        if(website) vc += `URL;TYPE=WORK:${website}\r\n`;
        if(wechat) vc += `IMPP:weixin://dl/chat?${wechat}\r\n`;
        let wa = getSocial('whatsappInput', 'whatsapp'); if(wa) vc += `URL;TYPE=WhatsApp:${wa}\r\n`;
        let fb = getSocial('facebookInput', 'facebook'); if(fb) vc += `URL;TYPE=Facebook:${fb}\r\n`;
        let tw = getSocial('xInput', 'twitter'); if(tw) vc += `URL;TYPE=X:${tw}\r\n`;
        let yt = getSocial('youtubeInput', 'youtube'); if(yt) vc += `URL;TYPE=YouTube:${yt}\r\n`;
        let ig = getSocial('instagramInput', 'instagram'); if(ig) vc += `URL;TYPE=Instagram:${ig}\r\n`;
        let li = getSocial('linkedinInput', 'linkedin'); if(li) vc += `URL;TYPE=LinkedIn:${li}\r\n`;
        if(address) vc += `ADR;TYPE=WORK:;;${address.replace(/,/g, ';')};;;;\r\n`;
        if(maps) vc += `URL;TYPE=Map:${maps}\r\n`;
        vc += "END:VCARD\r\n";
        return vc;
    }
    
    function getCurrentQRText() {
        const activePanel = document.querySelector('.tab-panel.active-panel')?.id;
        if (activePanel === 'vcard-tab') return buildVCard();
        if (activePanel === 'url-tab') { let url = document.getElementById('urlInput')?.value; if (!url.startsWith('http')) url = 'https://' + url; return url || 'https://'; }
        if (activePanel === 'crypto-tab') return getCryptoURI() || 'bitcoin:';
        if (activePanel === 'location-tab') { let lat = document.getElementById('latitude')?.value.trim(); let lng = document.getElementById('longitude')?.value.trim(); return (lat && lng) ? `geo:${lat},${lng}` : 'geo:0,0'; }
        if (activePanel === 'facebook-tab') { let url = document.getElementById('facebookUrlInput')?.value; if (!url.startsWith('http')) url = 'https://' + url; return url || 'https://facebook.com'; }
        if (activePanel === 'x-tab') { let url = document.getElementById('xUrlInput')?.value; if (!url.startsWith('http')) url = 'https://' + url; return url || 'https://x.com'; }
        if (activePanel === 'youtube-tab') { let url = document.getElementById('youtubeUrlInput')?.value; if (!url.startsWith('http')) url = 'https://' + url; return url || 'https://youtube.com'; }
        if (activePanel === 'instagram-tab') { let url = document.getElementById('instagramUrlInput')?.value; if (!url.startsWith('http')) url = 'https://' + url; return url || 'https://instagram.com'; }
        if (activePanel === 'linkedin-tab') { let url = document.getElementById('linkedinUrlInput')?.value; if (!url.startsWith('http')) url = 'https://' + url; return url || 'https://linkedin.com'; }
        if (activePanel === 'whatsapp-tab') { 
            let num = document.getElementById('whatsappNumber')?.value.replace(/[^0-9+]/g, '');
            if (!num) return 'https://api.whatsapp.com/send?phone=';
            let digits = num.replace('+', '');
            return `https://api.whatsapp.com/send?phone=${digits}`;
        }
        if (activePanel === 'github-tab') { let url = document.getElementById('githubUrlInput')?.value; if (!url.startsWith('http')) url = 'https://' + url; return url || 'https://github.com'; }
        if (activePanel === 'behance-tab') { let url = document.getElementById('behanceUrlInput')?.value; if (!url.startsWith('http')) url = 'https://' + url; return url || 'https://behance.net'; }
        if (activePanel === 'hikmah-tab') { let url = document.getElementById('hikmahUrlInput')?.value; if (!url.startsWith('http') && url) url = 'https://' + url; return url || 'https://hikmah.net/@'; }
        if (activePanel === 'text-tab') return document.getElementById('textInput')?.value || ' ';
        if (activePanel === 'email-tab') { let email = document.getElementById('emailAddress')?.value; let subj = document.getElementById('emailSubject')?.value; let msg = document.getElementById('emailMessage')?.value; let mailto = `mailto:${email}`; if (subj || msg) mailto += `?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(msg)}`; return mailto || 'mailto:'; }
        if (activePanel === 'phone-tab') return `tel:${document.getElementById('phoneNumber')?.value || ''}`;
        if (activePanel === 'sms-tab') { let num = document.getElementById('smsNumber')?.value; let msg = document.getElementById('smsMessage')?.value; return `sms:${num}${msg ? '?body='+encodeURIComponent(msg) : ''}`; }
        if (activePanel === 'wifi-tab') { let ssid = document.getElementById('wifiSsid')?.value.trim(); if (!ssid) return 'WIFI:S:;T:nopass;;'; let pass = document.getElementById('wifiPassword')?.value; let enc = document.getElementById('wifiEncryption')?.value; let encType = enc === 'WEP' ? 'WEP' : (enc === 'nopass' ? 'nopass' : 'WPA'); return `WIFI:S:${ssid};T:${encType};P:${pass};;`; }
        if (activePanel === 'event-tab') return buildEventVCalendar();
        return ' ';
    }
    
    function buildEventVCalendar() {
        const title = document.getElementById('eventTitle')?.value.trim() || '';
        const location = document.getElementById('eventLocation')?.value.trim() || '';
        const start = document.getElementById('eventStart')?.value || '';
        const end = document.getElementById('eventEnd')?.value || '';
        if (!title && !start) return "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nSUMMARY:Event\r\nDTSTART:20250101T000000Z\r\nEND:VEVENT\r\nEND:VCALENDAR";
        const formatDate = (dateStr) => dateStr ? dateStr.replace(/[-:]/g, '').replace('T', '') + '00' : "";
        let ical = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\n";
        if (title) ical += `SUMMARY:${title}\r\n`;
        if (location) ical += `LOCATION:${location}\r\n`;
        if (start) ical += `DTSTART:${formatDate(start)}\r\n`;
        if (end) ical += `DTEND:${formatDate(end)}\r\n`;
        ical += "END:VEVENT\r\nEND:VCALENDAR";
        return ical;
    }
    
    function updateQR() {
        const text = getCurrentQRText();
        renderQRWithLogoAndIcon(text);
    }
    
    function debouncedUpdate() {
        if (updateTimeout) clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => updateQR(), 50);
    }
    
    function setupAutoUpdate() {
        const allInputs = document.querySelectorAll('.auto-update-input');
        allInputs.forEach(input => {
            input.addEventListener('input', debouncedUpdate);
            input.addEventListener('change', debouncedUpdate);
        });
        document.getElementById('logoSize')?.addEventListener('input', () => updateQR());
        document.getElementById('eraseBehindLogo')?.addEventListener('change', () => updateQR());
        document.getElementById('centerIconSize')?.addEventListener('input', () => updateQR());
        document.getElementById('eraseBehindIcon')?.addEventListener('change', () => updateQR());
        document.getElementById('iconBgRadius')?.addEventListener('input', (e) => {
            document.getElementById('iconBgRadiusValue').innerText = e.target.value + 'px';
            updateQR();
        });
        const latInput = document.getElementById('latitude');
        const lngInput = document.getElementById('longitude');
        if (latInput && lngInput) {
            latInput.addEventListener('input', () => { updateMapFromCoordinates(); debouncedUpdate(); });
            lngInput.addEventListener('input', () => { updateMapFromCoordinates(); debouncedUpdate(); });
        }
    }
    
    function setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active-panel'));
                document.getElementById(tabId).classList.add('active-panel');
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                updateQR();
            });
        });
    }
    
    function setupAccordion() {
        const headers = document.querySelectorAll('.accordion-header');
        headers.forEach(header => {
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetId = header.getAttribute('data-target');
                const currentContent = document.getElementById(targetId);
                const isOpen = currentContent.classList.contains('open');
                document.querySelectorAll('.accordion-content').forEach(content => content.classList.remove('open'));
                document.querySelectorAll('.accordion-header .toggle-icon').forEach(icon => {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                });
                if (!isOpen) {
                    currentContent.classList.add('open');
                    const icon = header.querySelector('.toggle-icon');
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                }
            });
        });
    }
    
    function setupCenterIconSelector() {
        const icons = document.querySelectorAll('#centerIconSelectorGrid .icon-option');
        icons.forEach(icon => {
            icon.addEventListener('click', () => {
                icons.forEach(i => i.classList.remove('selected'));
                icon.classList.add('selected');
                const iconClass = icon.getAttribute('data-icon');
                currentCenterIconClass = iconClass;
                document.getElementById('centerIconStatus').innerHTML = `<i class="${iconClass}"></i> Selected: ${icon.querySelector('span').innerText}`;
                updateQR();
            });
        });
        document.getElementById('clearCenterIconBtn')?.addEventListener('click', () => {
            icons.forEach(i => i.classList.remove('selected'));
            currentCenterIconClass = null;
            document.getElementById('centerIconStatus').innerHTML = '<i class="fas fa-icons"></i> No icon selected';
            updateQR();
        });
        document.getElementById('centerIconSize')?.addEventListener('input', (e) => {
            document.getElementById('centerIconSizeValue').innerText = e.target.value + 'px';
            updateQR();
        });
        document.getElementById('iconBgRadius')?.addEventListener('input', (e) => {
            document.getElementById('iconBgRadiusValue').innerText = e.target.value + 'px';
        });
    }
    
    // Logo upload with progress bar
    const dropzone = document.getElementById('logoDropzone');
    const fileInput = document.getElementById('logoFileInput');
    if (dropzone) {
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.style.borderColor = 'var(--icon-color)'; });
        dropzone.addEventListener('dragleave', () => dropzone.style.borderColor = 'var(--input-border)');
        dropzone.addEventListener('drop', e => { e.preventDefault(); if(e.dataTransfer.files[0]) handleLogo(e.dataTransfer.files[0]); });
    }
    if (fileInput) fileInput.addEventListener('change', e => { if(e.target.files[0]) handleLogo(e.target.files[0]); });
    
    function showProgress() {
        const container = document.getElementById('logoProgressContainer');
        const bar = document.getElementById('logoProgressBar');
        container.style.display = 'block';
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
                setTimeout(() => { container.style.display = 'none'; }, 200);
            } else {
                width += 10;
                bar.style.width = width + '%';
            }
        }, 30);
    }
    
    function handleLogo(file) {
        showProgress();
        const reader = new FileReader();
        reader.onload = ev => {
            currentLogoDataURL = ev.target.result;
            const thumb = document.getElementById('logoThumb');
            const preview = document.getElementById('logoPreviewModern');
            const status = document.getElementById('logoStatus');
            if (thumb) thumb.src = currentLogoDataURL;
            if (preview) preview.style.display = 'block';
            if (status) status.innerHTML = '<i class="fas fa-check-circle"></i> Logo loaded';
            updateQR();
        };
        reader.readAsDataURL(file);
    }
    
    function downloadSVG() {
        const currentSvg = document.querySelector('#svgQrContainer svg');
        if (!currentSvg) return;
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(currentSvg);
        if (!source.includes('xmlns')) {
            source = source.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        const blob = new Blob([source], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qrcode.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function downloadPNG() {
        const currentSvg = document.querySelector('#svgQrContainer svg');
        if (!currentSvg) return;
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(currentSvg);
        if (!svgString.includes('xmlns')) {
            svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = 'qrcode.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        img.onerror = () => { console.error('PNG generation error'); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    }
    
    function downloadVCF() {
        const vcardData = buildVCard();
        const blob = new Blob([vcardData], {type: 'text/vcard;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contact.vcf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function initTheme() {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') document.body.classList.add('dark');
        document.getElementById('themeToggle').addEventListener('click', () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
            updateQR();
        });
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        setupAccordion();
        setupTabs();
        setupCryptoSelector();
        setupAutoUpdate();
        setupCenterIconSelector();
        document.getElementById('searchAddressBtn')?.addEventListener('click', () => {
            const address = document.getElementById('addressSearch').value;
            if (address.trim()) searchAddress(address);
            else document.getElementById('locationStatus').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please enter an address';
        });
        document.getElementById('downloadSvgBtn')?.addEventListener('click', downloadSVG);
        document.getElementById('downloadPngBtn')?.addEventListener('click', downloadPNG);
        document.getElementById('downloadVcfBtn')?.addEventListener('click', downloadVCF);
        document.getElementById('generateQrBtn')?.addEventListener('click', () => updateQR());
        updateQR();
    });