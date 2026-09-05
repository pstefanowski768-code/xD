// Audio System - Zarządzanie dźwiękami w grze

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.masterVolume = 0.7;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.initialized = true;
            this.createSounds();
        } catch (error) {
            console.warn("Audio nie dostępny:", error);
        }
    }

    createSounds() {
        // Footstep - Krok
        this.sounds.footstep = this.createFootstepSound();
        
        // Elevator bell - Dzwonek windy
        this.sounds.elevatorBell = this.createElevatorBellSound();
        
        // Door opening - Otwieranie drzwi
        this.sounds.doorOpen = this.createDoorOpenSound();
        
        // Door closing - Zamykanie drzwi
        this.sounds.doorClose = this.createDoorCloseSound();
        
        // Elevator moving - Winda się porusza
        this.sounds.elevatorMoving = this.createElevatorMovingSound();
    }

    // Proceduralne generowanie dźwięku kroków
    createFootstepSound() {
        const now = this.audioContext.currentTime;
        const duration = 0.15;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        // Krótki impuls z szumem
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            // Envelope
            let envelope = Math.exp(-t * 8);
            // Szum
            let noise = Math.random() * 2 - 1;
            // Niskie fale
            let wave = Math.sin(t * Math.PI * 80) * 0.5;
            channelData[i] = (noise * 0.4 + wave * 0.2) * envelope * 0.3;
        }
        
        return buffer;
    }

    // Dzwonek windy - przyjazd
    createElevatorBellSound() {
        const now = this.audioContext.currentTime;
        const duration = 0.8;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        // Dwie częstotliwości dla dzwonka
        const freq1 = 880;  // A5
        const freq2 = 1100; // Wyższa nuta
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            // Szybki decay
            const envelope = Math.exp(-t * 4);
            // Kombinacja dwóch sinusów
            const wave1 = Math.sin(2 * Math.PI * freq1 * (i / this.audioContext.sampleRate));
            const wave2 = Math.sin(2 * Math.PI * freq2 * (i / this.audioContext.sampleRate)) * 0.6;
            channelData[i] = (wave1 * 0.5 + wave2) * envelope * 0.5;
        }
        
        return buffer;
    }

    // Otwieranie drzwi - metaliczny głos
    createDoorOpenSound() {
        const duration = 0.6;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        // Metaliczny sound - opadająca częstotliwość
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            // Opadająca częstotliwość (sweep)
            const freq = 400 + (800 - 400) * (1 - t);
            const wave = Math.sin(2 * Math.PI * freq * (i / this.audioContext.sampleRate));
            
            // Szum metaliczny
            const noise = (Math.random() * 2 - 1) * 0.3;
            
            // Envelope - szybki wzrost, długi decay
            const envelope = Math.pow(Math.sin(t * Math.PI), 0.5) * Math.exp(-t * 2);
            
            channelData[i] = (wave * 0.6 + noise * 0.4) * envelope * 0.4;
        }
        
        return buffer;
    }

    // Zamykanie drzwi
    createDoorCloseSound() {
        const duration = 0.5;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        // Rosnąca częstotliwość
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            // Rosnąca częstotliwość (sweep w górę)
            const freq = 200 + (600 - 200) * t;
            const wave = Math.sin(2 * Math.PI * freq * (i / this.audioContext.sampleRate));
            
            // Szum
            const noise = (Math.random() * 2 - 1) * 0.2;
            
            // Envelope
            const envelope = Math.sin(t * Math.PI) * Math.exp(-t * 3);
            
            channelData[i] = (wave * 0.7 + noise * 0.3) * envelope * 0.35;
        }
        
        return buffer;
    }

    // Winda się porusza - niskie humienie
    createElevatorMovingSound() {
        const duration = 0.4;
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);
        
        // Niskie humienie z drżeniem
        const baseFreq = 60;
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.length;
            
            // Podstawowy ton
            const wave1 = Math.sin(2 * Math.PI * baseFreq * (i / this.audioContext.sampleRate)) * 0.4;
            
            // Wyższy harmonik
            const wave2 = Math.sin(2 * Math.PI * baseFreq * 1.5 * (i / this.audioContext.sampleRate)) * 0.2;
            
            // Drżenie amplitudy
            const tremolo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 8 * (i / this.audioContext.sampleRate));
            
            // Envelope
            const envelope = Math.pow(Math.sin(t * Math.PI), 0.8) * Math.exp(-t * 1.5);
            
            channelData[i] = (wave1 + wave2) * tremolo * envelope * 0.3;
        }
        
        return buffer;
    }

    // Odtwarzanie dźwięku
    play(soundName, options = {}) {
        if (!this.initialized || !this.sounds[soundName]) return;

        const buffer = this.sounds[soundName];
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        
        // Ustawienia
        const volume = options.volume !== undefined ? options.volume : 1.0;
        const playbackRate = options.rate !== undefined ? options.rate : 1.0;
        
        gainNode.gain.value = volume * this.masterVolume;
        source.playbackRate.value = playbackRate;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start(this.audioContext.currentTime);
    }

    // Odtwarzanie footstep z zmienną czasową
    playFootstep() {
        // Losowa zmiana częstotliwości
        const rate = 0.95 + Math.random() * 0.1;
        const volume = 0.4 + Math.random() * 0.2;
        this.play('footstep', { rate: rate, volume: volume });
    }

    // Sekwencja drzwi windy: otwarcie
    playElevatorDoorSequence(isOpening = true) {
        if (isOpening) {
            this.play('doorOpen', { volume: 0.6 });
        } else {
            this.play('doorClose', { volume: 0.6 });
        }
    }

    // Dzwonek - przyjazd windy
    playElevatorBell() {
        this.play('elevatorBell', { volume: 0.7 });
    }

    // Humienie windy
    playElevatorMoving() {
        this.play('elevatorMoving', { volume: 0.5 });
    }

    // Ustaw głośność główną
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}

// Globalna instancja audio managera
const audioManager = new AudioManager();
