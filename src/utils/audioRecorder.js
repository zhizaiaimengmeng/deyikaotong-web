// src/utils/audioRecorder.js
export class AudioRecorder {
    constructor(options = {}) {
        this.options = options;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.startTime = 0;
    }

    async start() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                    if (this.options.onDataAvailable) {
                        this.options.onDataAvailable(event.data);
                    }
                }
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const duration = (Date.now() - this.startTime) / 1000;

                if (this.options.onStop) {
                    this.options.onStop(audioBlob, duration);
                }

                this.cleanup();
            };

            this.startTime = Date.now();
            this.mediaRecorder.start();

            if (this.options.onStart) {
                this.options.onStart();
            }

        } catch (error) {
            throw new Error(`无法访问麦克风: ${error.message}`);
        }
    }

    stop() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
    }

    cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }
}