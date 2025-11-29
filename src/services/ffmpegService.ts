import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export class FFmpegService {
    private ffmpeg: FFmpeg;
    private loaded: boolean = false;

    constructor() {
        this.ffmpeg = new FFmpeg();
    }

    async load() {
        if (this.loaded) return;

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

        await this.ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        this.loaded = true;
    }

    async extractAudio(videoFile: File, onProgress: (progress: number) => void): Promise<Blob> {
        if (!this.loaded) await this.load();

        const inputName = 'input.mp4';
        const outputName = 'output.mp3';

        await this.ffmpeg.writeFile(inputName, await fetchFile(videoFile));

        this.ffmpeg.on('progress', ({ progress }) => {
            onProgress(Math.round(progress * 100));
        });

        // Extract audio: -vn (no video), -acodec libmp3lame, -q:a 2 (high quality)
        await this.ffmpeg.exec(['-i', inputName, '-vn', '-acodec', 'libmp3lame', '-q:a', '2', outputName]);

        const data = await this.ffmpeg.readFile(outputName);
        // Cast to any to avoid SharedArrayBuffer vs ArrayBuffer type mismatch
        return new Blob([data as any], { type: 'audio/mp3' });
    }
}

// Helper to fetch file data
const fetchFile = async (file: File): Promise<Uint8Array> => {
    return new Uint8Array(await file.arrayBuffer());
};

export const ffmpegService = new FFmpegService();
