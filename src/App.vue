<template>
  <span>
    <div class="loader-spinner" hidden>
      <pulse-loader :loading="true" :color="'#5dc596'" :size="'35px'"></pulse-loader>
    </div>
    <Player
      :type="json.type"
      :custom_image="json.custom_image"
      :soundwave="json.soundwave"
      :song_title="json.song_title"
      :song_artist="json.song_artist"
      :album_image="json.album_image"
      :images="images"
      :drawPos="json.drawPos"
      :scale="json.scale"
      :shape="json.shape"
      :watermark="true"
      :mode="'cart'"
      :class="{ 'cart': type === 'cart'}"
    v-if="type === 'cart'" />
    <!-- <img :src="json.checkout_image" alt="product" v-if="type === 'cart'"> -->
    <Order
      :soundsonner="json"
     v-else-if=" type === 'order'" />
    <Editor 
      v-else-if="type === 'editor'"
      :order="order"
      />
    <Downloader v-else-if="type === 'downloader'"
      :soundsonner="json"
    />
    <Form v-else />
  </span>
</template>

<script>
import images from './services/images'
import Form from './components/Form.vue'
import Editor from './components/Editor.vue'
import Downloader from './components/Downloader.vue'
import Order from './components/Order.vue'
import Player from './components/Player.vue'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'

export default {
  name: 'App',
  components: {
    Form,
    Editor,
    Downloader,
    Order,
    Player,
    PulseLoader
  },
  data() {
    let json = this.$parent.json ? JSON.parse(atob(this.$parent.json)) : null
    if (this.$parent.type === 'order' || this.$parent.type === 'downloader') json = json.soundsonner
    if (this.$parent.type === 'cart') {
      json = JSON.parse(document.querySelector('#json-content-soundsonner').textContent)
    }
    return {
      images,
      type: this.$parent.type,
      json,
      order: this.$parent.order
    }
  },
  mounted() {
    if (this.type === 'cart') {
      window.addEventListener('resize', this.resize)
      this.resize()
    }
  },
  methods: {
    resize() {
      if( window.innerWidth < 1052 && window.innerWidth > 773) {
        document.querySelector('.form__spotify-player__container').classList.add('cart-modifier')
      } else {
        document.querySelector('.form__spotify-player__container').classList.remove('cart-modifier')
      }
    }
  }
}
</script>

<style>
.loader-spinner {
  z-index: 99;
  position: absolute;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #01756f69;
  top: 0;
  right: 0;
}
.form__spotify-player.cart {
  box-shadow: none !important;
}
.cart > .watermark-logo.cart-modifier:before {
        background-size: 53vw;
      position: absolute;
      max-width: 59vw;
      margin-left: -14vw;
      width: 59vw;
      height: 6vw;
      margin-top: 22vw;
}
@media only screen and (min-width: 1000px) {
  .cart > .watermark-logo:before {
    background-size: 613px;
    position: absolute;
    max-width: 775px;
    margin-left: -197px;
    width: 765px;
    height: 200px;
    margin-top: 200px;
    opacity: .08;
    transform: rotate(-64deg);
    background-position: 50%;
    background-repeat: no-repeat;
  }
}

</style>
