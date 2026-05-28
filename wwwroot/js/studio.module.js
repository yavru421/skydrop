// ============================================================
// studio.module.js — Audio Engine & Step Sequencer Scheduler
// ============================================================

let audioCtx = null;
let schedulerId = null;
let playheadCallback = null;
let dotNetHelper = null;

// Sequencer state
let isPlaying = false;
let bpm = 120;
let currentStep = 0;
let nextNoteTime = 0.0; // When the next 16th note is due
const scheduleAheadTime = 0.1; // How far ahead to schedule audio (seconds)
const lookahead = 25.0; // How frequently to call scheduling function (ms)

// Step matrix grid state (5 tracks, 16 steps)
// 0: Kick, 1: Snare, 2: Hi-Hat, 3: Clap, 4: Melody Synth
let grid = [
    new Array(16).fill(false), // Kick
    new Array(16).fill(false), // Snare
    new Array(16).fill(false), // Hi-Hat
    new Array(16).fill(false), // Clap
    new Array(16).fill(false)  // Melody Synth
];

// Melody pitch notes mapping to steps (values will store midi or frequency)
let melodyPitches = new Array(16).fill(261.63); // Default middle C4 (Hz)

// ── initialization ──────────────────────────────────────────
export function initStudio(helper, callback) {
    dotNetHelper = helper;
    playheadCallback = callback;
}

// ── startPlay ───────────────────────────────────────────────
export function startPlay(initialGrid, initialMelody, initialBpm) {
    if (isPlaying) return;

    // Create or resume AudioContext
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx || audioCtx.state === 'closed') {
        audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    grid = initialGrid;
    melodyPitches = initialMelody;
    bpm = initialBpm;
    isPlaying = true;
    currentStep = 0;
    nextNoteTime = audioCtx.currentTime + 0.05;

    schedulerId = setInterval(schedulerLoop, lookahead);
}

// ── stopPlay ────────────────────────────────────────────────
export function stopPlay() {
    isPlaying = false;
    if (schedulerId) {
        clearInterval(schedulerId);
        schedulerId = null;
    }
}

// ── updateState ─────────────────────────────────────────────
export function updateState(newGrid, newMelody, newBpm) {
    grid = newGrid;
    melodyPitches = newMelody;
    bpm = newBpm;
}

// ── schedulerLoop ───────────────────────────────────────────
function schedulerLoop() {
    while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
        scheduleNote(currentStep, nextNoteTime);
        advanceNote();
    }
}

// ── advanceNote ─────────────────────────────────────────────
function advanceNote() {
    // 16th notes advance
    const secondsPerBeat = 60.0 / bpm;
    const secondsPerStep = secondsPerBeat / 4.0; // 4 steps per beat
    nextNoteTime += secondsPerStep;

    // Send playhead index update to Blazor
    if (dotNetHelper && playheadCallback) {
        try {
            dotNetHelper.invokeMethodAsync(playheadCallback, currentStep);
        } catch (_) {}
    }

    currentStep = (currentStep + 1) % 16;
}

// ── scheduleNote ────────────────────────────────────────────
function scheduleNote(step, time) {
    // 0: Kick
    if (grid[0][step]) playKickSynth(time);
    
    // 1: Snare
    if (grid[1][step]) playSnareSynth(time);

    // 2: Hi-Hat
    if (grid[2][step]) playHiHatSynth(time);

    // 3: Clap
    if (grid[3][step]) playClapSynth(time);

    // 4: Melody Synth
    if (grid[4][step]) playMelodySynth(melodyPitches[step], time);
}

// ── Synthesizers ────────────────────────────────────────────

function playKickSynth(time) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    // Deep punchy swept sine
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.12);

    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    osc.start(time);
    osc.stop(time + 0.16);
}

function playSnareSynth(time) {
    // 1. Noise channel (for the rattle)
    const noiseBuffer = createNoiseBuffer();
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = audioCtx.createGain();
    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noiseGain.gain.setValueAtTime(0.35, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    // 2. Osc channel (for the drum body punch)
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.08);

    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);

    oscGain.gain.setValueAtTime(0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    noiseNode.start(time);
    noiseNode.stop(time + 0.18);

    osc.start(time);
    osc.stop(time + 0.12);
}

function playHiHatSynth(time) {
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = createNoiseBuffer();

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = audioCtx.createGain();

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);

    noiseNode.start(time);
    noiseNode.stop(time + 0.05);
}

function playClapSynth(time) {
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = createNoiseBuffer();

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 3;

    const gain = audioCtx.createGain();
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    // Clap has multiple quick decay impulses
    const claps = 3;
    const clapSpacing = 0.012;
    for (let i = 0; i < claps; i++) {
        const triggerTime = time + i * clapSpacing;
        gain.gain.setValueAtTime(0.4, triggerTime);
        gain.gain.exponentialRampToValueAtTime(0.05, triggerTime + 0.01);
    }

    const tailTime = time + claps * clapSpacing;
    gain.gain.setValueAtTime(0.4, tailTime);
    gain.gain.exponentialRampToValueAtTime(0.01, tailTime + 0.2);

    noiseNode.start(time);
    noiseNode.stop(time + 0.25);
}

function playMelodySynth(frequency, time) {
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, time);
    filter.frequency.exponentialRampToValueAtTime(2000, time + 0.1);
    filter.frequency.exponentialRampToValueAtTime(400, time + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.24);

    osc.start(time);
    osc.stop(time + 0.26);
}

// Helper to create white noise
let cachedNoiseBuffer = null;
function createNoiseBuffer() {
    if (cachedNoiseBuffer) return cachedNoiseBuffer;
    const sampleRate = 44100;
    const bufferSize = sampleRate * 1.0; // 1 second
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    cachedNoiseBuffer = noiseBuffer;
    return noiseBuffer;
}
