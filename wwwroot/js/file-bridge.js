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
            this.peer = new Peer();
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
            if (data.type === 'metadata') {
                this.expectedSize = data.size;
                this.expectedFileName = data.name;
                this.expectedFileType = data.fileType;
                this.receivedChunks = [];
                this.receivedSize = 0;
            } else if (data instanceof ArrayBuffer) {
                this.receivedChunks.push(data);
                this.receivedSize += data.byteLength;
                
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
        
        // Send metadata first
        this.connection.send({
            type: 'metadata',
            name: file.name,
            size: file.size,
            fileType: file.type
        });
        
        const arrayBuffer = await file.arrayBuffer();
        let offset = 0;
        
        while (offset < arrayBuffer.byteLength) {
            const chunk = arrayBuffer.slice(offset, offset + this.CHUNK_SIZE);
            this.connection.send(chunk);
            offset += this.CHUNK_SIZE;
            
            const percentage = Math.floor((offset / arrayBuffer.byteLength) * 100);
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

    dispose() {
        if (this.connection) {
            this.connection.close();
        }
        if (this.peer) {
            this.peer.destroy();
        }
    }
};
