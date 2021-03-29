<template>
    <div ref="order" class="order-container">
        <Player
        :type="soundsonner.type"
        :custom_image="soundsonner.custom_image"
        :soundwave="soundsonner.soundwave"
        :song_title="soundsonner.song_title"
        :song_artist="soundsonner.song_artist"
        :album_image="soundsonner.album_image"
        :images="images"
        :drawPos="soundsonner.drawPos"
        :scale="soundsonner.scale"
        :shape="soundsonner.shape"
        :mode="'order'"
        />
        <button class="download-button" type="button" @click="download">
            Descargar
        </button>
    </div>
</template>

<script>
import images from '../services/images'
import utils from '../services/utilis.service'
import Player from './Player'

export default {
  name: 'Order',
  components: {
      Player
  },
  props: {
    soundsonner: {
        type: Object,
        default: () => ({})
    },
  },
  data() {
      return {
          images
      }
  },
  mounted() {
  },
  methods: {
      download() {
        const pdf_images = {
            custom_images: this.soundsonner.custom_image,
            controls: images.controls2,
            like: images.like2,
            heart: images.heart_pdf,
            circle: images.circle_pdf
        }

        Promise.all([
            utils.getDataUri(this.soundsonner.album_image),
            utils.getDataUri(this.soundsonner.soundwave)]).then((values) => {
                pdf_images.album_image = values[0]
                pdf_images.soundwave = values[1]
                utils.drawAndDownloadPdf(
                    false,
                    pdf_images,
                    this.soundsonner.song_title,
                    this.soundsonner.song_artist,
                    this.soundsonner.shape,
                    this.soundsonner.type,
                    this.soundsonner.scale,
                    this.soundsonner.drawPos
                    )
        });
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.order-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.order-container > .form__spotify-player {
    box-shadow: none !important;
}
.download-button {
    margin: 10px;
    font-family: 'Montserrat', sans-serif;
    cursor: pointer;
    background-color: #01756f;
    color: #fff;
    border-radius: 50px;
    padding: 14px 25px 18px;
    font-weight: 700;
    font-size: 17px;
    max-width: 270px;
    width: 100%;
}
</style>
