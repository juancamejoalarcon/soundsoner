<template>
  <div class="gallery">
    <div class="gallery__container">
      <div v-for="item in gallery" :key="item.id">
        <div :id="item.id"></div>
      </div>
    </div>
  </div>
</template>

<script>

import WaveSurfer from 'wavesurfer.js';

export default {
  name: 'Gallery',
  props: {
  },
  emits: ['finish'],
  data() {
    return {
      gallery: []
    }
  },
  methods: {
    async add(soundWave) {
      this.gallery.unshift(soundWave)
      await this.$nextTick()
      this.createItems()
      console.log(this.gallery)
    },
    createItems() {
      this.gallery.forEach(item => {
        if (item.waveHtml) item.waveHtml.destroy()
        item.waveHtml = WaveSurfer.create({
            container: '#' + item.id,
            barWidth: item.barWidth,
            barHeight: item.barHeight,
            barGap: item.barGap,
            height: item.height,
            backgroundColor: item.backgroundColor,
            waveColor: item.waveColor,
          });
          item.waveHtml.loadBlob(item.blob)
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.gallery {
}
</style>
