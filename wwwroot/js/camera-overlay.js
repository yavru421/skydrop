let targetYCoordinates = [];
let isRendering = false;
let canvasRef = null;
let contextRef = null;
let clickCallback = null;

function renderLoop() {
    if (!isRendering) return;
    window.requestAnimationFrame(renderLoop);

    if (!canvasRef || !contextRef) return;

    contextRef.clearRect(0, 0, canvasRef.width, canvasRef.height);
    contextRef.strokeStyle = '#00FF00';
    contextRef.lineWidth = 4;

    for (let i = 0; i < targetYCoordinates.length; i++) {
        const y = Math.floor(targetYCoordinates[i]);
        contextRef.beginPath();
        contextRef.moveTo(0, y);
        contextRef.lineTo(canvasRef.width, y);
        contextRef.stroke();
    }
}

export function updateCalibrationLines(yArray) {
    targetYCoordinates = yArray || [];
    if (!isRendering) {
        isRendering = true;
        renderLoop();
    }
}

export function registerClickCallback(callback) {
    clickCallback = callback;
}

export function startCamera() {
    // Staged as a hook/trigger if camera setup needs explicit start/restart
    console.log("startCamera triggered via JSImport");
}

/**
 * Initializes the camera stream and overlays a Canvas element on top of it.
 * Designed to separate hardware-facing media capture from application state.
 *
 * @param {string} containerId - The ID of the container element.
 */
export async function initializeMediaOverlay(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        throw new Error(`Container with ID "${containerId}" not found.`);
    }

    // Clear any existing content in the container
    container.innerHTML = "";

    // 1. Create and configure the video element
    const video = document.createElement("video");
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    
    // Programmatic settings required to prevent iOS Safari from hijacking full screen
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");

    // 2. Create and configure the canvas element
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "10";
    canvas.style.background = "transparent";

    // Retain canvas and context references
    canvasRef = canvas;
    contextRef = canvas.getContext("2d");

    // 3. Create and configure the interaction event capture layer
    const interactionDiv = document.createElement("div");
    interactionDiv.style.position = "absolute";
    interactionDiv.style.top = "0";
    interactionDiv.style.left = "0";
    interactionDiv.style.width = "100%";
    interactionDiv.style.height = "100%";
    interactionDiv.style.zIndex = "20";
    interactionDiv.style.background = "transparent";

    interactionDiv.addEventListener("pointerdown", (event) => {
        const rect = container.getBoundingClientRect();
        const clickYPercent = (event.clientY - rect.top) / rect.height;
        const scaledY = Math.floor(clickYPercent * canvas.height);

        if (clickCallback) {
            clickCallback(scaledY);
        }
    });

    // Append elements to container
    container.appendChild(video);
    container.appendChild(canvas);
    container.appendChild(interactionDiv);

    // 4. Set up resolution & High-DPI coordinate alignment when metadata loads
    video.addEventListener("loadedmetadata", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    });

    // 5. Request the camera stream using Rear Camera Stream Constraints (with fallback)
    const constraints = {
        video: {
            facingMode: { exact: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
    } catch (error) {
        console.warn("Exact environment facingMode failed, falling back to soft constraints.", error);
        
        const fallbackConstraints = {
            video: {
                facingMode: "environment"
            },
            audio: false
        };
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            video.srcObject = stream;
        } catch (fallbackError) {
            console.error("Failed to acquire camera stream with soft constraints.", fallbackError);
            throw fallbackError;
        }
    }
}
