
window.addEventListener('DOMContentLoaded', function() {
                                // Ensure QRScanner is available (qr-scanner.umd.min.js exposes QrScanner)
                                if (!window.QRScanner && window.QrScanner) window.QRScanner = window.QrScanner;
                                if (!window.QRScanner) {
                                        alert('QR Scanner library failed to load. Please check your internet connection.');
                                        return;
                                }

                                // Toggle logic
                                const scannerToggle = document.getElementById('scannerToggle');
                                const generatorToggle = document.getElementById('generatorToggle');
                                const scannerPanel = document.getElementById('scannerPanel');
                                const generatorPanel = document.getElementById('generatorPanel');
                                scannerToggle.onclick = () => {
                                        scannerToggle.classList.add('active');
                                        generatorToggle.classList.remove('active');
                                        scannerPanel.style.display = 'block';
                                        generatorPanel.style.display = 'none';
                                };
                                generatorToggle.onclick = () => {
                                        generatorToggle.classList.add('active');
                                        scannerToggle.classList.remove('active');
                                        scannerPanel.style.display = 'none';
                                        generatorPanel.style.display = 'flex';
                                };

                                // Results state
                                let scanResults = [];
                                function renderScanResults() {
                                        const table = document.getElementById('scanResultsTable');
                                        const scanCount = document.getElementById('scanCount');
                                        table.innerHTML = '';
                                        scanResults.forEach((item, idx) => {
                                                let type = 'Text';
                                                let display = item;
                                                if (item.startsWith('BEGIN:VCARD')) {
                                                        type = 'vCard';
                                                        display = '<b>vCard</b>';
                                                } else if (/^https?:\/\//.test(item)) {
                                                        type = 'URL';
                                                        display = `<b>URL:</b> <a href="${item}" target="_blank">${item}</a>`;
                                                }
                                                table.innerHTML += `
                                                        <tr style="border-bottom:1px solid var(--border-color);">
                                                                <td style="padding:6px 8px;">${idx+1}</td>
                                                                <td style="padding:6px 8px;">${display}</td>
                                                                <td style="text-align:center;">
                                                                        <span style="background:var(--preview-bg);padding:2px 8px;border-radius:12px;font-size:0.9em;">${type}</span>
                                                                </td>
                                                                <td style="text-align:center;">
                                                                        <button onclick="navigator.clipboard.writeText(scanResults[${idx}])" title="Copy" style="background:none;border:none;cursor:pointer;color:var(--icon-color);font-size:1.1em;"><i class='fas fa-copy'></i></button>
                                                                        <button onclick="scanResults.splice(${idx},1);renderScanResults();" title="Delete" style="background:none;border:none;cursor:pointer;color:#ff3b3b;font-size:1.1em;"><i class='fas fa-trash'></i></button>
                                                                </td>
                                                        </tr>
                                                `;
                                        });
                                        if (scanCount) scanCount.textContent = scanResults.length;
                                }
                                function showScanResult(result) {
                                        const note = document.getElementById('qrDropZoneNote');
                                        if (!result) {
                                                if (note) note.textContent = 'Nothing found in QR code';
                                                return;
                                        }
                                        scanResults.push(result);
                                        renderScanResults();
                                        if (note) note.textContent = '';
                                }
                                // Upload logic
                                const qrImageInput = document.getElementById('qrImageInput');
                                const qrUploadBtn = document.getElementById('qrUploadBtn');
                                qrUploadBtn.onclick = () => qrImageInput.click();
                                qrImageInput.addEventListener('change', (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => scanImage(ev.target.result);
                                                reader.readAsDataURL(file);
                                        }
                                });
                                // Drag & drop
                                const qrDropZone = document.getElementById('qrDropZone');
                                qrDropZone.addEventListener('dragover', (e) => { e.preventDefault(); qrDropZone.classList.add('hover'); });
                                qrDropZone.addEventListener('dragleave', (e) => { e.preventDefault(); qrDropZone.classList.remove('hover'); });
                                qrDropZone.addEventListener('drop', (e) => {
                                        e.preventDefault();
                                        qrDropZone.classList.remove('hover');
                                        const file = e.dataTransfer.files[0];
                                        if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => scanImage(ev.target.result);
                                                reader.readAsDataURL(file);
                                        }
                                });
                                // Paste logic
                                const qrPasteCatcher = document.getElementById('qrPasteCatcher');
                                function handlePasteEvent(e) {
                                        let found = false;
                                        const items = (e.clipboardData || window.clipboardData).items;
                                        for (let i = 0; i < items.length; i++) {
                                                if (items[i].type.indexOf('image') !== -1) {
                                                        const file = items[i].getAsFile();
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => scanImage(ev.target.result);
                                                        reader.readAsDataURL(file);
                                                        found = true;
                                                        break;
                                                }
                                        }
                                        if (!found) {
                                                const note = document.getElementById('qrDropZoneNote');
                                                if (note) note.textContent = 'No image found in clipboard.';
                                        }
                                }
                                qrDropZone.addEventListener('paste', (e) => {
                                        e.preventDefault();
                                        handlePasteEvent(e);
                                });
                                qrDropZone.addEventListener('focus', () => {
                                        qrPasteCatcher.value = '';
                                        qrPasteCatcher.focus();
                                });
                                qrDropZone.addEventListener('blur', () => {
                                        qrPasteCatcher.blur();
                                });
                                qrPasteCatcher.addEventListener('paste', (e) => {
                                        handlePasteEvent(e);
                                });
                                window.addEventListener('paste', (e) => {
                                        const isScannerVisible = scannerPanel && scannerPanel.style.display !== 'none';
                                        if (isScannerVisible && document.activeElement === qrDropZone) {
                                                qrPasteCatcher.value = '';
                                                qrPasteCatcher.focus();
                                        }
                                });
                                // Scan image
                                async function scanImage(dataUrl) {
                                        const note = document.getElementById('qrDropZoneNote');
                                        if (note) note.textContent = 'Scanning...';
                                        try {
                                                const text = await window.QRScanner.scanImage(dataUrl);
                                                showScanResult(text);
                                        } catch {
                                                showScanResult(null);
                                        }
                                }
                                // Clear all
                                document.getElementById('clearAllBtn').onclick = () => {
                                        scanResults = [];
                                        renderScanResults();
                                };
                                // Download all (as txt)
                                document.getElementById('downloadAllBtn').onclick = () => {
                                        if (!scanResults.length) return;
                                        const blob = new Blob([scanResults.join('\n---\n')], {type: 'text/plain'});
                                        const a = document.createElement('a');
                                        a.href = URL.createObjectURL(blob);
                                        a.download = 'qr-results.txt';
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                };
                                // Tab switching (camera tab placeholder only)
                                document.getElementById('tabUpload').onclick = function() {
                                        this.classList.add('active');
                                        document.getElementById('tabCamera').classList.remove('active');
                                        document.getElementById('qrDropZone').style.display = '';
                                };
                                document.getElementById('tabCamera').onclick = function() {
                                        this.classList.add('active');
                                        document.getElementById('tabUpload').classList.remove('active');
                                        document.getElementById('qrDropZone').style.display = 'none';

                                        // Camera scan implementation
                                        let cameraModal = document.getElementById('cameraModal');
                                        if (!cameraModal) {
                                                cameraModal = document.createElement('div');
                                                cameraModal.id = 'cameraModal';
                                                cameraModal.style.position = 'fixed';
                                                cameraModal.style.top = '0';
                                                cameraModal.style.left = '0';
                                                cameraModal.style.width = '100vw';
                                                cameraModal.style.height = '100vh';
                                                cameraModal.style.background = 'rgba(0,0,0,0.7)';
                                                cameraModal.style.display = 'flex';
                                                cameraModal.style.alignItems = 'center';
                                                cameraModal.style.justifyContent = 'center';
                                                cameraModal.style.zIndex = '9999';
                                                cameraModal.innerHTML = `
                                                        <div style="background:#222;padding:24px 24px 16px 24px;border-radius:18px;box-shadow:0 8px 32px #000a;display:flex;flex-direction:column;align-items:center;max-width:95vw;max-height:90vh;">
                                                                <video id="qrCameraVideo" style="width:340px;max-width:80vw;border-radius:12px;background:#000;" autoplay muted></video>
                                                                <div id="qrCameraStatus" style="color:#fff;margin:10px 0 0 0;font-size:1.1em;min-height:1.2em;"></div>
                                                                <button id="closeCameraBtn" class="btn-outline" style="margin-top:14px;">Close</button>
                                                        </div>
                                                `;
                                                document.body.appendChild(cameraModal);
                                        } else {
                                                cameraModal.style.display = 'flex';
                                        }
                                        const video = document.getElementById('qrCameraVideo');
                                        const status = document.getElementById('qrCameraStatus');
                                        status.textContent = 'Starting camera...';
                                        let stream = null;
                                        let stopScan = false;
                                        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                                                .then(s => {
                                                        stream = s;
                                                        video.srcObject = stream;
                                                        status.textContent = 'Point camera at QR code';
                                                        scanLoop();
                                                })
                                                .catch(() => {
                                                        status.textContent = 'Unable to access camera.';
                                                });
                                        async function scanLoop() {
                                                if (stopScan) return;
                                                try {
                                                        const result = await window.QRScanner.scanImage(video, { returnDetailedScanResult: false });
                                                        if (result) {
                                                                showScanResult(result);
                                                                status.textContent = 'QR code found!';
                                                                stopScan = true;
                                                                setTimeout(() => closeCamera(), 1200);
                                                                return;
                                                        }
                                                } catch {}
                                                if (!stopScan) setTimeout(scanLoop, 350);
                                        }
                                        function closeCamera() {
                                                stopScan = true;
                                                if (stream) {
                                                        stream.getTracks().forEach(track => track.stop());
                                                }
                                                cameraModal.style.display = 'none';
                                        }
                                        document.getElementById('closeCameraBtn').onclick = closeCamera;
                                };
});