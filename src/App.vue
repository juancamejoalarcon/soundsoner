<template>
  <div id="app">
    <Timer
      ref="timer"
      @finish="onCounterFinished"
      v-if="currentPhase === 'counting'"
    />
    <Recorder
      ref="recorder"
      @finish="recordingFinished"
      v-if="currentPhase === 'recording'"
    />
    <Editor
      ref="editor"
      @recordAgain="addWaveToGallery"
      @addToCar="addToCart"
      v-if="currentPhase === 'editing'"
    />
    <button type="button" @click="startTimer" v-if="currentPhase === 'init'">
      Grabar
    </button>
    <button @click="addToCart">Añadir al carro</button>
    <Gallery ref="gallery" />
  </div>
</template>

<script>
import axios from "axios";

import Timer from "@/components/Timer";
import Recorder from "@/components/Recorder";
import Editor from "@/components/Editor";
import Gallery from "@/components/Gallery";

export default {
  name: "App",
  components: {
    Timer,
    Recorder,
    Editor,
    Gallery,
  },
  data() {
    return {
      currentPhase: "init",
    };
  },
  mounted() {},
  methods: {
    async startTimer() {
      this.currentPhase = "counting";
      await this.$nextTick();
      this.$refs.timer.start();
    },
    async onCounterFinished() {
      this.currentPhase = "recording";
      await this.$nextTick();
      this.$refs.recorder.start();
    },
    async recordingFinished(value) {
      this.currentPhase = "editing";
      await this.$nextTick();
      this.$refs.editor.start(value);
    },
    addWaveToGallery(soundWave) {
      this.$refs.gallery.add(soundWave);
      this.startTimer();
    },
    addToCart() {
      /*global wc_add_to_cart_params*/
      axios
        .post(wc_add_to_cart_params.ajax_url, {
            action: 'woocommerce_ajax_add_to_cart',
            product_id: 'caca',
            product_sku: '',
            quantity: 1,
            variation_id: 0,
          })
        .then(
          (response) => {
            console.log(response);
            console.log('caca');
          },
          (error) => {
            console.log(error);
          }
        );
    },
  },
};
</script>

<style>
html {
  box-sizing: border-box;
}
*,
*::before,
*::after {
  box-sizing: inherit;
  margin: 0;
  padding: 0;
}

*:focus {
  outline: none;
}
</style>
