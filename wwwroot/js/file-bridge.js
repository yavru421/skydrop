window.fileBridge = {
    peer: null,
    connection: null,
    dotNetRef: null,
    CHUNK_SIZE: 64 * 1024, // 64KB
    receivedChunks: [],
    receivedSize: 0,
    expectedSize: 0,
    expectedFileName: '',
    expectedFileType: '',

    async initialize(dotNetRef) {
        this.dotNetRef = dotNetRef;
        try {
            const response = await fetch('/api/turn');
            if (!response.ok) {
                throw new Error(`TURN API failed with status ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`TURN API returned non-JSON content: ${contentType}`);
            }
            const turnCredentials = await response.json();
            
            this.peer = new Peer({
                config: {
                    iceServers: turnCredentials.iceServers || [
                        { urls: 'stun:stun.l.google.com:19302' }
                    ]
                }
            });
        } catch (error) {
            console.error('Failed to initialize PeerJS with custom TURN, falling back:', error);
            this.peer = new Peer({
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' }
                    ]
                }
            });
        }

        this.peer.on('open', (id) => {
            this.dotNetRef.invokeMethodAsync('TriggerPeerIdGenerated', id);
        });

        this.peer.on('connection', (conn) => {
            this.connection = conn;
            this.setupConnectionHandlers();
        });

        this.peer.on('disconnected', () => {
            this.dotNetRef.invokeMethodAsync('TriggerDisconnected');
        });
    },

    connectToPeer(peerId) {
        if (!this.peer) return;
        this.connection = this.peer.connect(peerId, { reliable: true });
        this.setupConnectionHandlers();
    },

    setupConnectionHandlers() {
        this.connection.on('open', () => {
            this.dotNetRef.invokeMethodAsync('TriggerConnected');
        });

        this.connection.on('data', (data) => {
            if (data && data.type === 'metadata') {
                this.expectedSize = data.size;
                this.expectedFileName = data.name;
                this.expectedFileType = data.fileType;
                this.receivedChunks = [];
                this.receivedSize = 0;
                this.dotNetRef.invokeMethodAsync('TriggerTransferProgress', 0);
            } else if (data) {
                const byteLength = data.byteLength || data.size || data.length || 0;
                this.receivedChunks.push(data);
                this.receivedSize += byteLength;
                
                const percentage = Math.floor((this.receivedSize / this.expectedSize) * 100);
                this.dotNetRef.invokeMethodAsync('TriggerTransferProgress', percentage);
                
                if (this.receivedSize >= this.expectedSize) {
                    this.assembleAndDownload();
                }
            }
        });

        this.connection.on('close', () => {
            this.dotNetRef.invokeMethodAsync('TriggerDisconnected');
        });
    },

    async sendFile(file) {
        if (!this.connection || !this.connection.open) return;
        
        this.connection.send({
            type: 'metadata',
            name: file.name,
            size: file.size,
            fileType: file.type
        });
        
        let offset = 0;
        const readSlice = (o, size) => new Promise((resolve, reject) => {
            const slice = file.slice(o, o + size);
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(slice);
        });

        while (offset < file.size) {
            // Respect WebRTC buffer limit to avoid closing the channel
            if (this.connection.dataChannel && this.connection.dataChannel.bufferedAmount > 1024 * 1024 * 2) {
                await new Promise(r => setTimeout(r, 50));
                continue;
            }

            const chunk = await readSlice(offset, this.CHUNK_SIZE);
            this.connection.send(chunk);
            offset += chunk.byteLength;
            
            const percentage = Math.floor((offset / file.size) * 100);
            this.dotNetRef.invokeMethodAsync('TriggerTransferProgress', percentage);
        }
        
        this.dotNetRef.invokeMethodAsync('TriggerTransferComplete');
    },

    assembleAndDownload() {
        const blob = new Blob(this.receivedChunks, { type: this.expectedFileType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = this.expectedFileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        this.dotNetRef.invokeMethodAsync('TriggerTransferComplete');
        
        this.receivedChunks = [];
        this.receivedSize = 0;
    },

    setupDropZone(elementId) {
        const dropZone = document.getElementById(elementId);
        if (!dropZone) return;
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                this.sendFile(e.dataTransfer.files[0]);
            }
        });
    },

    dispose() {
        if (this.connection) {
            this.connection.close();
        }
        if (this.peer) {
            this.peer.destroy();
        }
    }
};
