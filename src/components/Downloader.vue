<template>
  <div class="downloader-container" ref="downloader"></div>
</template>

<script>

import images from '../services/images'
import utils from '../services/utilis.service'

export default {
  name: "Downloader",
  components: {
  },
  props: {
    soundsonner: {
        type: Object,
        default: () => ({})
    },
  },
  data() {
    return {
        images,
        datauri: ''
    };
  },
  mounted() {
    // console.log(this.soundsonner)
    this.downloadPDF()
    const header = document.querySelector('header');
    if (header) header.hidden = true;
  },
  methods: {
    downloadPDF() {
        const pdf_images = {
            custom_images: this.soundsonner.custom_image,
            controls: images.controls2,
            like: images.like2,
            heart: images.heart_pdf,
            circle: images.heart_pdf
        }

        Promise.all([
            utils.getDataUri(this.soundsonner.album_image),
            utils.getDataUri(this.soundsonner.soundwave)]).then((values) => {
                pdf_images.album_image = values[0]
                pdf_images.soundwave = values[1]
                utils.drawAndDownloadPdf(
                    true,
                    pdf_images,
                    this.soundsonner.song_title,
                    this.soundsonner.song_artist,
                    this.soundsonner.shape,
                    this.soundsonner.type,
                    this.soundsonner.scale,
                    this.soundsonner.drawPos
                    ).then((data) => {
                      this.$refs.downloader.innerHTML = "<iframe width='100%' height='100%' src='" + data + "'></iframe>"
                    })
        });
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.downloader-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
}
</style>
