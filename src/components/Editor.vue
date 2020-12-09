<template>
  <div class="editor">
    <div class="editor__container">
      <div class="editor__wave">
        <div id="waveeditor"></div>
      </div>
      <div class="editor__menu">
        <button type="button" ref="play">Play</button>
        <button type="button" @click="recordAgain">Grabar otro</button>
        <button type="button" @click="addToCar">Añadir al carrito</button>
        <div class="color-picker">
          <input type="color" value="#ff0000" @input="changeWave">
          <label>Color ola</label>
        </div>
        <div class="color-picker">
          <input type="color" value="#ff0000" @input="changeBackground">
          <label>Color fondo</label>
        </div>
        <div class="range">
            <input  type="range" value="5" min="2" max="11" @change="changeBarWidth">
            <label>Bar width</label>
        </div>
        <div class="range">
            <input type="range" value="2" min="2" max="8" @change="changeBarHeight">
            <label>Bar height</label>
        </div>
        <div class="range">
            <input type="range" min="2" max="8" @change="changeBarGap">
            <label>Bar gap</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import WaveSurfer from 'wavesurfer.js';

export default {
  name: 'Editor',
  props: {
  },
  emits: ['finish', 'recordAgain', 'addToCar'],
  data() {
    return {
      blob: null,
      wavesurferEditor: null,
      height: 300,
      barHeight: 2,
      barWidth: 5,
      barGap: null,
      waveColor: 'red',
      backgroundColor: 'blue',
    }
  },
  methods: {
    start(blob) {
      this.blob = blob;
      this.createWave()
    },
    createWave() {
      if (this.wavesurferEditor) this.wavesurferEditor.destroy()
      this.wavesurferEditor = WaveSurfer.create({
          container: '#waveeditor',
          barWidth: this.barWidth,
          barHeight: this.barHeight,
          barGap: this.barGap,
          height: this.height,
          backgroundColor: this.backgroundColor,
          waveColor: this.waveColor,
      });

      this.wavesurferEditor.on('error', function(e) {
          console.warn(e);
      });

      this.wavesurferEditor.loadBlob(this.blob);
      this.$refs.play.addEventListener('click', this.wavesurferEditor.playPause.bind(this.wavesurferEditor))
    },
    changeWave(e) {
      this.waveColor = e.target.value;
      this.createWave()
    },
    changeBackground(e) {
      this.backgroundColor = e.target.value;
      this.createWave()
    },
    changeBarWidth(e) {
      this.barWidth = e.target.value;
      this.createWave()
    },
    changeBarHeight(e) {
      this.barHeight = e.target.value;
      this.createWave()
    },
    changeBarGap(e) {
      this.barGap = e.target.value;
      this.createWave()
    },
    recordAgain() {
      this.$emit('recordAgain', {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10),
        barWidth: this.barWidth,
        barHeight: this.barHeight,
        barGap: this.barGap,
        height: this.height,
        backgroundColor: this.backgroundColor,
        waveColor: this.waveColor,
        blob: this.blob
      })
    },
    addToCar() {
      this.$emit('addToCar', {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10),
        barWidth: this.barWidth,
        barHeight: this.barHeight,
        barGap: this.barGap,
        height: this.height,
        backgroundColor: this.backgroundColor,
        waveColor: this.waveColor,
        blob: this.blob
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.editor {
}
</style>
