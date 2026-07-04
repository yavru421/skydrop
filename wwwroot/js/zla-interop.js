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
    }
};
