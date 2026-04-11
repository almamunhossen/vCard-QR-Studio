let currentLogoDataURL = null;
let currentCenterIconClass = null;
let updateTimeout = null;
let currentCrypto = 'bitcoin';
let currentQrDotStyle = 'square';
let currentQrMarkerBorderStyle = 'square';
let currentQrDotScale = 1;

// SVG icon mapping to local files
const iconMap = {
    'address-card': { file: 'images/icons/address-card.svg', name: 'Address Card' },
    'behance': { file: 'images/icons/behance.svg', name: 'Behance' },
    'bitcoin': { file: 'images/icons/bitcoin.svg', name: 'Bitcoin' },
    'codepen': { file: 'images/icons/codepen-logo.svg', name: 'CodePen' },
    'dribbble': { file: 'images/icons/dribbble.svg', name: 'Dribbble' },
    'email': { file: 'images/icons/Email.svg', name: 'Email' },
    'event': { file: 'images/icons/Event.svg', name: 'Event' },
    'flights': { file: 'images/icons/flights.svg', name: 'Flights' },
    'hajj-umrah': { file: 'images/icons/hajj-umrah.svg', name: 'Hajj Umrah' },
    'holidays': { file: 'images/icons/holidays.svg', name: 'Holidays' },
    'transfers': { file: 'images/icons/transfers.svg', name: 'Transfers' },
    'facebook': { file: 'images/icons/Facebook.svg', name: 'Facebook' },
    'github': { file: 'images/icons/GitHub.svg', name: 'GitHub' },
    'github-1': { file: 'images/icons/github-1.svg', name: 'GitHub Alt' },
    'hikmah': { file: 'images/icons/hikmah.svg', name: 'Hikmah' },
    'home': { file: 'images/icons/home.svg', name: 'Home' },
    'instagram': { file: 'images/icons/Instagram.svg', name: 'Instagram' },
    'link': { file: 'images/icons/link.svg', name: 'Link' },
    'linkedin': { file: 'images/icons/linkedIn.svg', name: 'LinkedIn' },
    'location': { file: 'images/icons/Location.svg', name: 'Location' },
    'message': { file: 'images/icons/message.svg', name: 'Message' },
    'mobile': { file: 'images/icons/mobile.svg', name: 'Mobile' },
    'person': { file: 'images/icons/person.svg', name: 'Person' },
    'pinterest': { file: 'images/icons/pinterest.svg', name: 'Pinterest' },
    'sms': { file: 'images/icons/sms.svg', name: 'SMS' },
    'snapchat': { file: 'images/icons/snapchat.svg', name: 'Snapchat' },
    'telephone': { file: 'images/icons/telephone.svg', name: 'Telephone' },
    'telephone-1': { file: 'images/icons/telephone-1.svg', name: 'Telephone 1' },
    'telephone-3': { file: 'images/icons/telephone-3.svg', name: 'Telephone 3' },
    'twitter': { file: 'images/icons/twitter.svg', name: 'Twitter' },
    'whatsapp': { file: 'images/icons/whatsapp.svg', name: 'WhatsApp' },
    'wifi': { file: 'images/icons/wifi.svg', name: 'WiFi' },
    'wifi-logo': { file: 'images/icons/WiFi_Logo.svg', name: 'WiFi Logo' },
    'x': { file: 'images/icons/x.svg', name: 'X' },
    'youtube': { file: 'images/icons/YouTube.svg', name: 'YouTube' }
};

// Load SVG icons
let loadedSvgIcons = {};

const getElement = (id) => document.getElementById(id);
const getInputValue = (id) => getElement(id)?.value.trim() || '';
const normalizeUrl = (value, fallbackUrl = '') => {
    if (!value) return fallbackUrl;
    if (!/^https?:\/\//i.test(value)) value = 'https://' + value;
    return value;
};
const formatSocialUsername = (value, baseUrl) => {
    if (!value) return baseUrl;
    if (/^https?:\/\//i.test(value)) return value;
    return baseUrl + value.replace(/^@/, '');
};
const formatWhatsAppLink = (value) => {
    const number = (value || '').replace(/[^0-9+]/g, '');
    if (!number) return 'https://api.whatsapp.com/send?phone=';
    return `https://api.whatsapp.com/send?phone=${number.replace('+', '')}`;
};
const makeMailtoLink = (email, subject, message) => {
    let mailto = `mailto:${email || ''}`;
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (message) params.push(`body=${encodeURIComponent(message)}`);
    if (params.length) mailto += `?${params.join('&')}`;
    return mailto;
};
const makeSmsLink = (number, message) => {
    const body = message ? `?body=${encodeURIComponent(message)}` : '';
    return `sms:${number || ''}${body}`;
};
const makeWifiString = (ssid, password, encryption) => {
    if (!ssid) return 'WIFI:S:;T:nopass;;';
    const encType = encryption === 'WEP' ? 'WEP' : encryption === 'nopass' ? 'nopass' : 'WPA';
    return `WIFI:S:${ssid};T:${encType};P:${password};;`;
};
const createDownloadLink = (href, filename) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

function loadSvgIcons() {
    const promises = Object.entries(iconMap).map(([iconKey, item]) => {
        return fetch(item.file)
            .then(response => response.text())
            .then(svgText => {
                loadedSvgIcons[iconKey] = svgText;
            })
            .catch(error => {
                console.warn(`Failed to load SVG icon ${iconKey}:`, error);
            });
    });
    return Promise.all(promises);
}
    
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
        document.querySelectorAll('.crypto-option').forEach(opt => {
            const radio = opt.querySelector('input[type="radio"]');
            opt.addEventListener('click', () => {
                if (radio) { radio.checked = true; currentCrypto = radio.value; updateQR(); }
            });
            if (radio) radio.addEventListener('change', (e) => {
                if (e.target.checked) { currentCrypto = e.target.value; updateQR(); }
            });
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
    
    function normalizeUnicodeText(text) {
        if (typeof text !== 'string') return text;
        return text.normalize ? text.normalize('NFC') : text;
    }

    function utf8ByteString(text) {
        const normalized = normalizeUnicodeText(text);
        if (typeof TextEncoder !== 'undefined') {
            const bytes = new TextEncoder().encode(normalized);
            return Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
        }
        return unescape(encodeURIComponent(normalized));
    }

    function getFinderPatternOrigins(moduleCount) {
        return [
            { row: 0, col: 0 },
            { row: 0, col: moduleCount - 7 },
            { row: moduleCount - 7, col: 0 }
        ];
    }

    function isFinderPatternCell(row, col, moduleCount) {
        return getFinderPatternOrigins(moduleCount).some(origin => {
            return row >= origin.row && row < origin.row + 7 && col >= origin.col && col < origin.col + 7;
        });
    }

    function drawQrDot(x, y, cellSize, color) {
        const dotScale = Math.max(0.55, Math.min(1, currentQrDotScale));
        const dotSize = cellSize * dotScale;
        const inset = (cellSize - dotSize) / 2;
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;

        if (currentQrDotStyle === 'dots') {
            return `<circle cx="${centerX}" cy="${centerY}" r="${dotSize / 2}" fill="${color}" />`;
        }

        if (currentQrDotStyle === 'diamond') {
            return `<rect x="${x + inset}" y="${y + inset}" width="${dotSize}" height="${dotSize}" transform="rotate(45 ${centerX} ${centerY})" fill="${color}" />`;
        }

        if (currentQrDotStyle === 'rounded') {
            const radius = dotSize * 0.32;
            return `<rect x="${x + inset}" y="${y + inset}" width="${dotSize}" height="${dotSize}" rx="${radius}" ry="${radius}" fill="${color}" />`;
        }

        return `<rect x="${x + inset}" y="${y + inset}" width="${dotSize}" height="${dotSize}" fill="${color}" />`;
    }

    function drawFinderPattern(row, col, cellSize, color, backgroundColor) {
        const x = col * cellSize;
        const y = row * cellSize;
        const outerSize = cellSize * 7;
        const middleInset = cellSize;
        const middleSize = cellSize * 5;
        const innerInset = cellSize * 2;
        const innerSize = cellSize * 3;

        if (currentQrMarkerBorderStyle === 'circle') {
            const cx = x + outerSize / 2;
            const cy = y + outerSize / 2;
            return `
                <circle cx="${cx}" cy="${cy}" r="${outerSize / 2}" fill="${color}" />
                <circle cx="${cx}" cy="${cy}" r="${middleSize / 2}" fill="${backgroundColor}" />
                <circle cx="${cx}" cy="${cy}" r="${innerSize / 2}" fill="${color}" />
            `;
        }

        const radiusMap = {
            square: 0,
            rounded: cellSize * 1.55
        };
        const outerRadius = radiusMap[currentQrMarkerBorderStyle] ?? 0;
        const middleRadius = currentQrMarkerBorderStyle === 'rounded' ? cellSize * 1.05 : 0;
        const innerRadius = currentQrMarkerBorderStyle === 'rounded' ? cellSize * 0.7 : 0;

        return `
            <rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${outerRadius}" ry="${outerRadius}" fill="${color}" />
            <rect x="${x + middleInset}" y="${y + middleInset}" width="${middleSize}" height="${middleSize}" rx="${middleRadius}" ry="${middleRadius}" fill="${backgroundColor}" />
            <rect x="${x + innerInset}" y="${y + innerInset}" width="${innerSize}" height="${innerSize}" rx="${innerRadius}" ry="${innerRadius}" fill="${color}" />
        `;
    }

    function renderQRWithLogoAndIcon(text) {
        if (!text || text === "") text = " ";
        const size = 220;
        let qr = qrcode(0, 'M');
        qr.addData(utf8ByteString(text), 'Byte');  // Provide raw UTF-8 bytes for QR byte mode
        qr.make();
        const moduleCount = qr.getModuleCount();
        const cellSize = size / moduleCount;
        const qrDarkColor = getComputedStyle(document.body).getPropertyValue('--qr-dark-module').trim() || '#000000';
        const qrBackgroundColor = getComputedStyle(document.body).getPropertyValue('--qr-bg-color').trim() || '#FFFFFF';
        
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="geometricPrecision">`;
        svg += `<rect width="${size}" height="${size}" fill="${qrBackgroundColor}"/>`;
        
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col) && !isFinderPatternCell(row, col, moduleCount)) {
                    let x = col * cellSize;
                    let y = row * cellSize;
                    svg += drawQrDot(x, y, cellSize, qrDarkColor);
                }
            }
        }

        getFinderPatternOrigins(moduleCount).forEach(origin => {
            svg += drawFinderPattern(origin.row, origin.col, cellSize, qrDarkColor, qrBackgroundColor);
        });
        
        const centerX = size / 2;
        const centerY = size / 2;
        
        // Draw center icon if selected (using SVG)
        if (currentCenterIconClass && loadedSvgIcons[currentCenterIconClass]) {
            const iconSizeVal = parseInt(document.getElementById('centerIconSize')?.value || 55);
            const eraseBg = document.getElementById('eraseBehindIcon')?.checked;
            const bgRadius = parseInt(document.getElementById('iconBgRadius')?.value || 12);
            
            const bgPadding = 8;
            const bgWidth = iconSizeVal + bgPadding * 2;
            const bgHeight = iconSizeVal + bgPadding * 2;
            const bgX = centerX - bgWidth / 2;
            const bgY = centerY - bgHeight / 2;
            
            if (eraseBg) {
                svg += `<rect x="${bgX}" y="${bgY}" width="${bgWidth}" height="${bgHeight}" fill="${qrBackgroundColor}" rx="${bgRadius}" />`;
            }
            
            // Embed SVG icon directly
            const iconSvg = loadedSvgIcons[currentCenterIconClass];
            const iconX = centerX - iconSizeVal / 2;
            const iconY = centerY - iconSizeVal / 2;
            
            // Create a group for the icon with proper scaling and positioning
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(iconSvg, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
            const viewBox = svgElement.getAttribute('viewBox');
            let scale = iconSizeVal / 512; // default scale
            
            if (viewBox) {
                const [x, y, width, height] = viewBox.split(' ').map(Number);
                const maxDim = Math.max(width, height);
                scale = iconSizeVal / maxDim;
            }
            
            svg += `<g transform="translate(${iconX}, ${iconY}) scale(${scale})" fill="${qrDarkColor}">`;
            // Extract all paths from the SVG and add them
            const pathElements = svgDoc.querySelectorAll('path');
            if (pathElements.length > 0) {
                pathElements.forEach(pathElement => {
                    const d = pathElement.getAttribute('d');
                    if (d) {
                        svg += `<path d="${d}" />`;
                    }
                });
            } else {
                // Fallback: try to extract other SVG elements like circles, rects, etc.
                const allElements = svgDoc.querySelectorAll('*');
                allElements.forEach(element => {
                    if (element.tagName.toLowerCase() !== 'svg') {
                        const attrs = Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ');
                        svg += `<${element.tagName} ${attrs} />`;
                    }
                });
            }
            svg += `</g>`;
        }
        
        // Draw logo on top if present
        if (currentLogoDataURL) {
            const logoSizeVal = parseInt(document.getElementById('logoSize')?.value || 55);
            const eraseBgLogo = document.getElementById('eraseBehindLogo')?.checked;
            const logoX = (size - logoSizeVal) / 2;
            const logoY = (size - logoSizeVal) / 2;
            if (eraseBgLogo) {
                svg += `<rect x="${logoX-2}" y="${logoY-2}" width="${logoSizeVal+4}" height="${logoSizeVal+4}" fill="${qrBackgroundColor}" rx="8" />`;
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
    
    function escapeVCardText(value) {
        return value
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,');
    }

    function splitVCardName(fullName) {
        const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
        if (!parts.length) {
            return { familyName: '', givenName: '' };
        }

        if (parts.length === 1) {
            return { familyName: '', givenName: parts[0] };
        }

        const familyName = parts.pop() || '';
        return {
            familyName,
            givenName: parts.join(' ')
        };
    }

    function addMobileNumberField() {
        const container = document.getElementById('extraMobileContainer');
        if (!container) return;
        const count = container.querySelectorAll('.mobile-extra-row').length + 2;
        const row = document.createElement('div');
        row.className = 'input-row mobile-extra-row';
        row.innerHTML = `
            <input type="text" data-mobile-label placeholder="Label (e.g. WhatsApp)" class="auto-update-input" value="Mobile Other ${count}">
            <input type="tel" data-mobile-input placeholder="+880..." class="auto-update-input" />
            <button type="button" class="btn-outline remove-mobile-btn" style="padding:0.55rem 0.9rem; white-space:nowrap;"><i class="fas fa-times"></i></button>
        `;
        const removeBtn = row.querySelector('.remove-mobile-btn');
        removeBtn.addEventListener('click', () => {
            row.remove();
            updateQR();
        });
        container.appendChild(row);
        updateQR();
    }

    function addDigitalField(type) {
        const configs = {
            email: {
                containerId: 'extraEmailContainer',
                label: 'Email',
                inputType: 'email',
                placeholder: 'email@example.com',
                dataAttribute: 'data-email-input'
            },
            website: {
                containerId: 'extraWebsiteContainer',
                label: 'Website',
                inputType: 'url',
                placeholder: 'https://...',
                dataAttribute: 'data-website-input'
            }
        };
        const config = configs[type];
        if (!config) return;
        const container = document.getElementById(config.containerId);
        if (!container) return;

        const count = container.querySelectorAll('.digital-extra-row').length + 2;
        const row = document.createElement('div');
        row.className = 'input-row digital-extra-row';
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.style.alignItems = 'center';
        row.innerHTML = `
            <label style="flex: 0 0 140px;">${config.label} ${count}</label>
            <input type="${config.inputType}" ${config.dataAttribute} placeholder="${config.placeholder}" class="auto-update-input" style="flex:1;" />
            <button type="button" class="btn-outline remove-digital-btn" style="padding:0.55rem 0.9rem; white-space:nowrap;"><i class="fas fa-times"></i></button>
        `;
        const removeBtn = row.querySelector('.remove-digital-btn');
        removeBtn.addEventListener('click', () => {
            row.remove();
            updateDigitalLabels(type);
            updateQR();
        });
        container.appendChild(row);
    }

    function addSocialLinkField() {
        const container = document.getElementById('extraSocialContainer');
        if (!container) return;

        const count = container.querySelectorAll('.social-extra-row').length + 1;
        const row = document.createElement('div');
        row.className = 'input-row social-extra-row';

        row.innerHTML = `
            <input type="text" data-social-label placeholder="Label (e.g. Telegram)" class="auto-update-input" value="Social ${count}">
            <input type="url" data-social-link-input placeholder="https://..." class="auto-update-input">
            <button type="button" class="btn-outline remove-social-btn" style="padding:0.55rem 0.9rem; white-space:nowrap;"><i class="fas fa-times"></i></button>
        `;

        const removeBtn = row.querySelector('.remove-social-btn');
        removeBtn.addEventListener('click', () => {
            row.remove();
            updateQR();
        });

        container.appendChild(row);
        updateQR();
    }

    function updateDigitalLabels(type) {
        const containerId = type === 'website' ? '#extraWebsiteContainer' : '#extraEmailContainer';
        document.querySelectorAll(`${containerId} .digital-extra-row`).forEach((row, index) => {
            const label = row.querySelector('label');
            if (label) label.textContent = `${type === 'website' ? 'Website' : 'Email'} ${index + 2}`;
        });
    }

    function resetCenterIconSettings() {
        const sizeInput = document.getElementById('centerIconSize');
        const radiusInput = document.getElementById('iconBgRadius');
        const eraseInput = document.getElementById('eraseBehindIcon');
        if (sizeInput) {
            sizeInput.value = 55;
            document.getElementById('centerIconSizeValue').innerText = '55px';
        }
        if (radiusInput) {
            radiusInput.value = 12;
            document.getElementById('iconBgRadiusValue').innerText = '12px';
        }
        if (eraseInput) eraseInput.checked = false;
        updateQR();
    }

    function buildVCard() {
        const fullName = document.getElementById('fullName')?.value.trim() || '';
        const jobTitle = document.getElementById('jobTitle')?.value.trim() || '';
        const org = document.getElementById('organization')?.value.trim() || '';
        let phoneWork = document.getElementById('phoneWork')?.value.trim() || '';
        const ext = document.getElementById('phoneWorkExt')?.value.trim() || '';
        if (phoneWork && ext) phoneWork += ` ext ${ext}`;
        const phonePrivate = document.getElementById('phonePrivate')?.value.trim() || '';
        const fax = document.getElementById('faxPrivate')?.value.trim() || '';
        const wechat = document.getElementById('wechatId')?.value.trim() || '';
        const address = document.getElementById('vcardAddress')?.value.trim() || '';
        const maps = document.getElementById('vcardMapsUrl')?.value.trim() || '';

        const emailInputs = Array.from(document.querySelectorAll('[data-email-input]'));
        const websiteInputs = Array.from(document.querySelectorAll('[data-website-input]'));

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
            if (type === 'tiktok') return val.startsWith('http') ? val : `https://tiktok.com/@${val.replace(/^@/, '')}`;
            if (type === 'snapchat') return val.startsWith('http') ? val : `https://snapchat.com/add/${val}`;
            if (type === 'behance') return val.startsWith('http') ? val : `https://behance.net/${val}`;
            return val;
        };

        const safe = (text) => escapeVCardText(text);
        let vc = "BEGIN:VCARD\r\nVERSION:3.0\r\n";
        if (fullName) {
            const structuredName = splitVCardName(fullName);
            vc += `FN;CHARSET=UTF-8:${safe(fullName)}\r\n`;
            vc += `N;CHARSET=UTF-8:${safe(structuredName.familyName)};${safe(structuredName.givenName)};;;\r\n`;
            vc += `SORT-STRING;CHARSET=UTF-8:${safe(structuredName.familyName || structuredName.givenName || fullName)}\r\n`;
        } else {
            vc += `FN;CHARSET=UTF-8:Contact\r\n`;
            vc += `N;CHARSET=UTF-8:;Contact;;;\r\n`;
        }
        if (org) vc += `ORG;CHARSET=UTF-8:${safe(org)}\r\n`;
        if (jobTitle) vc += `TITLE;CHARSET=UTF-8:${safe(jobTitle)}\r\n`;
        if (phoneWork) vc += `TEL;TYPE=WORK,VOICE:${phoneWork.replace(/\s/g, '')}\r\n`;
        if (phonePrivate) vc += `TEL;TYPE=HOME,VOICE:${phonePrivate.replace(/\s/g, '')}\r\n`;

        const staticMobileInputs = Array.from(document.querySelectorAll('#phoneAcc .grid-2 [data-mobile-input]'));
        staticMobileInputs.forEach(input => {
            const value = input.value.trim();
            if (value) vc += `TEL;TYPE=CELL,VOICE:${value.replace(/\s/g, '')}\r\n`;
        });

        const extraMobileRows = Array.from(document.querySelectorAll('#extraMobileContainer .mobile-extra-row'));
        extraMobileRows.forEach((row, index) => {
            const number = row.querySelector('[data-mobile-input]')?.value.trim() || '';
            const label = row.querySelector('[data-mobile-label]')?.value.trim() || `MobileOther${index + 2}`;
            if (!number) return;

            const safeType = label.replace(/[^a-zA-Z0-9_-]/g, '');
            vc += `TEL;TYPE=${safeType || `MobileOther${index + 2}`}:${number.replace(/\s/g, '')}\r\n`;
        });

        emailInputs.forEach(input => {
            const value = input.value.trim();
            if (value) vc += `EMAIL;TYPE=WORK,INTERNET:${value}\r\n`;
        });

        websiteInputs.forEach(input => {
            const value = input.value.trim();
            if (value) vc += `URL;TYPE=WORK:${value}\r\n`;
        });
        if (fax) vc += `TEL;TYPE=HOME,FAX:${fax.replace(/\s/g, '')}\r\n`;
        if (wechat) vc += `IMPP;CHARSET=UTF-8:weixin://dl/chat?${encodeURIComponent(wechat)}\r\n`;
        let wa = getSocial('whatsappInput', 'whatsapp'); if (wa) vc += `URL;TYPE=WhatsApp:${wa}\r\n`;
        let fb = getSocial('facebookInput', 'facebook'); if (fb) vc += `URL;TYPE=Facebook:${fb}\r\n`;
        let tw = getSocial('xInput', 'twitter'); if (tw) vc += `URL;TYPE=X:${tw}\r\n`;
        let yt = getSocial('youtubeInput', 'youtube'); if (yt) vc += `URL;TYPE=YouTube:${yt}\r\n`;
        let ig = getSocial('instagramInput', 'instagram'); if (ig) vc += `URL;TYPE=Instagram:${ig}\r\n`;
        let li = getSocial('linkedinInput', 'linkedin'); if (li) vc += `URL;TYPE=LinkedIn:${li}\r\n`;
        let tk = getSocial('tikTokInput', 'tiktok'); if (tk) vc += `URL;TYPE=TikTok:${tk}\r\n`;
        let sc = getSocial('snapchatInput', 'snapchat'); if (sc) vc += `URL;TYPE=Snapchat:${sc}\r\n`;
        let bh = getSocial('behanceInput', 'behance'); if (bh) vc += `URL;TYPE=Behance:${bh}\r\n`;

        const extraSocialRows = Array.from(document.querySelectorAll('.social-extra-row'));
        extraSocialRows.forEach((row, index) => {
            const label = row.querySelector('[data-social-label]')?.value.trim() || `Social${index + 1}`;
            const value = row.querySelector('[data-social-link-input]')?.value.trim() || '';
            if (!value) return;

            const safeType = label.replace(/[^a-zA-Z0-9_-]/g, '');
            vc += `URL;TYPE=${safeType || `Social${index + 1}`}:${value}\r\n`;
        });
        if (address) vc += `ADR;TYPE=WORK;CHARSET=UTF-8:;;${safe(address).replace(/,/g, ';')};;;;\r\n`;
        if (maps) vc += `URL;TYPE=Map:${maps}\r\n`;
        vc += "END:VCARD\r\n";
        return vc;
    }
    
    function getCurrentQRText() {
        const activePanel = document.querySelector('.tab-panel.active-panel')?.id;
        const normalizePanelUrl = (id, fallback) => normalizeUrl(getInputValue(id), fallback);
        const handlers = {
            'vcard-tab': buildVCard,
            'url-tab': () => normalizePanelUrl('urlInput', 'https://'),
            'crypto-tab': () => getCryptoURI() || 'bitcoin:',
            'location-tab': () => {
                const lat = getInputValue('latitude');
                const lng = getInputValue('longitude');
                return (lat && lng) ? `geo:${lat},${lng}` : 'geo:0,0';
            },
            'facebook-tab': () => formatSocialUsername(getInputValue('facebookUrlInput'), 'https://facebook.com/'),
            'x-tab': () => formatSocialUsername(getInputValue('xUrlInput'), 'https://x.com/'),
            'youtube-tab': () => formatSocialUsername(getInputValue('youtubeUrlInput'), 'https://youtube.com/@'),
            'instagram-tab': () => formatSocialUsername(getInputValue('instagramUrlInput'), 'https://instagram.com/'),
            'linkedin-tab': () => formatSocialUsername(getInputValue('linkedinUrlInput'), 'https://linkedin.com/in/'),
            'whatsapp-tab': () => formatWhatsAppLink(getInputValue('whatsappNumber')),
            'github-tab': () => normalizePanelUrl('githubUrlInput', 'https://github.com'),
            'behance-tab': () => formatSocialUsername(getInputValue('behanceUrlInput'), 'https://behance.net/'),
            'hikmah-tab': () => formatSocialUsername(getInputValue('hikmahUrlInput'), 'https://hikmah.net/@'),
            'pinterest-tab': () => normalizeUrl(getInputValue('pinUrlInput'), 'https://pinterest.com/'),
            'codepen-tab': () => normalizeUrl(getInputValue('codepenUrlInput'), 'https://codepen.io/'),
            'text-tab': () => getInputValue('textInput') || ' ',
            'email-tab': () => makeMailtoLink(getInputValue('emailAddress'), getInputValue('emailSubject'), getInputValue('emailMessage')),
            'phone-tab': () => `tel:${getInputValue('phoneNumber')}`,
            'sms-tab': () => makeSmsLink(getInputValue('smsNumber'), getInputValue('smsMessage')),
            'wifi-tab': () => makeWifiString(getInputValue('wifiSsid'), getInputValue('wifiPassword'), getInputValue('wifiEncryption')),
            'event-tab': buildEventVCalendar
        };
        return (handlers[activePanel] || (() => ' '))();
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
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.addEventListener('input', (event) => {
                if (event.target.matches('.auto-update-input')) debouncedUpdate();
            });
            appContainer.addEventListener('change', (event) => {
                if (event.target.matches('.auto-update-input')) debouncedUpdate();
            });
        }
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
                const iconKey = icon.getAttribute('data-icon');
                currentCenterIconClass = iconKey;
                document.getElementById('centerIconStatus').innerHTML = `<i class="fas fa-icons"></i> Selected: ${icon.querySelector('span').innerText}`;
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

    function setupQrStyleSelector() {
        const syncSelectedState = (options, selectedOption) => {
            options.forEach(option => {
                const isSelected = option === selectedOption;
                option.classList.toggle('selected', isSelected);
                option.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
            });
        };

        const updateDotSizeValue = (value) => {
            const normalizedValue = Math.max(55, Math.min(100, Number(value) || 84));
            currentQrDotScale = normalizedValue / 100;
            const dotSizeValue = document.getElementById('qrDotSizeValue');
            if (dotSizeValue) dotSizeValue.innerText = `${normalizedValue}%`;
        };

        const dotOptions = Array.from(document.querySelectorAll('[data-dot-style]'));
        const markerOptions = Array.from(document.querySelectorAll('[data-marker-style]'));
        const dotSizeInput = document.getElementById('qrDotSize');

        const initialDot = dotOptions.find(option => option.classList.contains('selected')) || dotOptions[0];
        const initialMarker = markerOptions.find(option => option.classList.contains('selected')) || markerOptions[0];

        if (initialDot) {
            currentQrDotStyle = initialDot.getAttribute('data-dot-style') || currentQrDotStyle;
            syncSelectedState(dotOptions, initialDot);
        }

        if (initialMarker) {
            currentQrMarkerBorderStyle = initialMarker.getAttribute('data-marker-style') || currentQrMarkerBorderStyle;
            syncSelectedState(markerOptions, initialMarker);
        }

        if (dotSizeInput) {
            updateDotSizeValue(dotSizeInput.value);
            dotSizeInput.addEventListener('input', (event) => {
                updateDotSizeValue(event.target.value);
                updateQR();
            });
        }

        dotOptions.forEach(option => {
            option.addEventListener('click', () => {
                currentQrDotStyle = option.getAttribute('data-dot-style') || currentQrDotStyle;
                syncSelectedState(dotOptions, option);
                updateQR();
            });
        });

        markerOptions.forEach(option => {
            option.addEventListener('click', () => {
                currentQrMarkerBorderStyle = option.getAttribute('data-marker-style') || currentQrMarkerBorderStyle;
                syncSelectedState(markerOptions, option);
                updateQR();
            });
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
        createDownloadLink(url, 'qrcode.svg');
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
            createDownloadLink(canvas.toDataURL('image/png'), 'qrcode.png');
        };
        img.onerror = () => { console.error('PNG generation error'); };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    }
    
    function downloadVCF() {
        const vcardData = buildVCard();
        const blob = new Blob(['\ufeff', vcardData], {type: 'text/vcard;charset=utf-8'});
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
    
    document.addEventListener('DOMContentLoaded', async () => {
        await loadSvgIcons();
        initTheme();
        setupAccordion();
        setupTabs();
        setupCryptoSelector();
        setupAutoUpdate();
        setupCenterIconSelector();
        setupQrStyleSelector();
        document.getElementById('searchAddressBtn')?.addEventListener('click', () => {
            const address = document.getElementById('addressSearch').value;
            if (address.trim()) searchAddress(address);
            else document.getElementById('locationStatus').innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please enter an address';
        });
        document.getElementById('downloadSvgBtn')?.addEventListener('click', downloadSVG);
        document.getElementById('downloadPngBtn')?.addEventListener('click', downloadPNG);
        document.getElementById('downloadVcfBtn')?.addEventListener('click', downloadVCF);
        document.getElementById('generateQrBtn')?.addEventListener('click', () => updateQR());
        document.getElementById('addMobileNumberBtn')?.addEventListener('click', () => addMobileNumberField());
        document.getElementById('addEmailFieldBtn')?.addEventListener('click', () => addDigitalField('email'));
        document.getElementById('addWebsiteFieldBtn')?.addEventListener('click', () => addDigitalField('website'));
        document.getElementById('addSocialLinkBtn')?.addEventListener('click', addSocialLinkField);
        document.getElementById('resetCenterIconBtn')?.addEventListener('click', () => resetCenterIconSettings());
        updateQR();
    });