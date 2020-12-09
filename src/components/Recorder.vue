<template>
  <div class="recorder">
    <div class="recorder__container">
      <div id="waverecorder"></div>
      <button type="button" @click="finish">Terminar</button>
    </div>
  </div>
</template>

<script>

import WaveSurfer from 'wavesurfer.js';
import MicrophonePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.min.js';

export default {
  name: 'Recorder',
  props: {
  },
  emits: ['finish'],
  data() {
    return {
      isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
      wavesurfer: null,
      context: null,
      processor: null,
      mediaRecorder: null,
      audioBlob: null,
      audioChunks: [],
    }
  },
  methods: {
    start() {
        if (this.isSafari) {
            // Safari 11 or newer automatically suspends new AudioContext's that aren't
            // created in response to a user-gesture, like a click or tap, so create one
            // here (inc. the script processor)
            const AudioContext =
                window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            this.processor = this.context.createScriptProcessor(1024, 1, 1);
        }

        // Init wavesurfer
        this.wavesurfer = WaveSurfer.create({
            container: '#waverecorder',
            waveColor: 'black',
            interact: false,
            cursorWidth: 0,
            audioContext: this.context || null,
            audioScriptProcessor: this.processor || null,
            plugins: [
                MicrophonePlugin.create({
                    bufferSize: 4096,
                    numberOfInputChannels: 1,
                    numberOfOutputChannels: 1,
                    constraints: {
                        video: false,
                        audio: true
                    }
                })
            ]
        });

        this.wavesurfer.microphone.on('deviceReady', (stream) => {
            console.info('Device ready!');
            this.audioChunks = []
            this.mediaRecorder = new MediaRecorder(stream);
            this.mediaRecorder.start();
            this.mediaRecorder.addEventListener('dataavailable', event=>{
                this.audioChunks.push(event.data);              
            })

            this.mediaRecorder.addEventListener("stop", () => {
                this.audioBlob = new Blob(this.audioChunks);
                this.wavesurfer.destroy()
                this.$emit('finish', this.audioBlob)
            });
        });
        this.wavesurfer.microphone.on('deviceError', function(code) {
            console.warn('Device error: ' + code);
        });
        this.wavesurfer.on('error', function(e) {
            console.warn(e);
        });
        this.wavesurfer.microphone.start();
    },
    finish() {
      this.wavesurfer.microphone.stop()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.recorder {
}
</style>
