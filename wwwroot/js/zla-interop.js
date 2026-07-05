window.zlaInterop = {
    generateQR: function (elementId, text) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.innerHTML = '';
        const canvas = document.createElement('canvas');
        el.appendChild(canvas);
        new QRious({
            element: canvas,
            value: text,
            size: 250,
            background: 'transparent',
            foreground: '#00f0ff' // Cyberpunk blue
        });
    },

    html5QrcodeScanner: null,

    startScanner: function (elementId, dotNetRef) {
        if (this.html5QrcodeScanner) {
            this.html5QrcodeScanner.clear().catch(err => console.warn(err));
        }

        this.html5QrcodeScanner = new Html5QrcodeScanner(
            elementId,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        this.html5QrcodeScanner.render((decodedText, decodedResult) => {
            // Stop scanning once we get a hit
            this.html5QrcodeScanner.clear();
            dotNetRef.invokeMethodAsync('HandleQRScanned', decodedText);
        }, (errorMessage) => {
            // Ignore parse errors (happens constantly while scanning)
        });
    },

    stopScanner: function () {
        if (this.html5QrcodeScanner) {
            this.html5QrcodeScanner.clear().catch(err => console.warn(err));
            this.html5QrcodeScanner = null;
        }
    },

    getRecentPeers: function () {
        try {
            const peers = localStorage.getItem('skydrop_recent_peers');
            return peers ? JSON.parse(peers) : [];
        } catch {
            return [];
        }
    },

    saveRecentPeer: function (peerId) {
        if (!peerId) return;
        try {
            let peers = this.getRecentPeers();
            peers = peers.filter(p => p !== peerId);
            peers.unshift(peerId);
            if (peers.length > 5) peers = peers.slice(0, 5);
            localStorage.setItem('skydrop_recent_peers', JSON.stringify(peers));
        } catch { }
    }
};
