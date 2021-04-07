<template>
<span>
    <!-- <div class="controls" v-if="type === 'personal' && mode === 'form'">
        <div class="clipper-rage-container">
            <span> Rotar: </span>
            <clipper-range class="clipper-range-wrapper" v-model="rotation" style="max-width:200px" :min="0" :max="360"></clipper-range>
        </div>
        <div class="controls-zoom">
            <span> Zoom: </span>
            <input type="range" min="0" max="300" value="100" @input="zoom">
        </div>
    </div> -->
    <div class="form__spotify-player" ref="player">
        <div class="controls-zoom" v-if="type === 'personal' && mode === 'form'">
            <div class="controls-zoom__button">
                <button type="button" @click="zoom(false)">-</button>
                <button type="button" @click="zoom(true)">+</button>
            </div>
        </div>
        <div class="form__spotify-player__container" 
        :class="{ 
            'watermark-logo': watermark,
            'border-none': mode === 'order' 
            }">
            <div class="form__spotify-player__image mask-image mask-image-circle">
                <img :src="album_image" v-if="type === 'spotify'">
                <clipper-fixed  v-if="type === 'personal'" 
                    class="basic lg clipper-fixed" 
                    :src="custom_image"
                    bg-color="black" 
                    :round="false"
                    preview="fixed-preview" 
                    shadow="rgba(0,0,0,0)"
                    :area="100"
                    ref="clipper"
                    @load="imgLoad"
                    :rotate="rotation"
                        ></clipper-fixed>
                <clipper-preview name="fixed-preview" class="basic lg clipper-fixed" v-if="mode === 'order' || mode === 'cart'"></clipper-preview>
            </div>
            <div class="form__spotify-player__soundwave">
                <img :src="soundwave" >
            </div>
            <div class="form__spotify-player__info">
                <div class="form__spotify-player__info__song">
                    <span class="form__spotify-player__info__song__name">{{ filteredTitle ? filteredTitle : 'Título de la canción'}}</span>
                    <span>{{ filteredArtist ? filteredArtist : 'Nombre del artista' }}</span>
                </div>
                <div class="form__spotify-player__info__like">
                    <img :src="images.like">
                </div>
            </div>
            <div class="form__spotify-player__player">
                <img :src="images.controls">
            </div>
        </div>
    </div>
    </span>
</template>

<script>

import AWS from '../services/s3.service'
import utils from '../services/utilis.service'

export default {
  name: 'Player',
  components: {

  },
  props: {
    type: {
        type: String,
        default: 'spotify'
    },
    custom_image: {
        type: String,
        default: ''
    },
    soundwave: {
        type: String,
        default: ''
    },
    song_title: {
        type: String,
        default: ''
    },
    song_artist: {
        type: String,
        default: ''
    },
    album_image: {
        type: String,
        default: ''
    },
    mode: {
        type: String,
        default: 'form'
    },
    shape: {
        type: String,
        default: 'classic'
    },
    images: {
        type: Object,
        default: () => ({})
    },
    drawPos: {
        type: Object,
        default: () => ({})
    },
    scale: {
        type: String,
        default: '1'
    },
    watermark: {
        type: Boolean,
        default: false
    },
  },
  data() {
      return {
          inited: false,
          filteredTitle: '',
          filteredArtist: '',
          rotation: 0
      }
  },
    watch: { 
        type: function (newVal) {
            if (newVal === 'personal') {
                this.setClipper()
            }
        },
        song_title: function () { this.filterTitleAndArtist() },
        song_artist: function () { this.filterTitleAndArtist() }
    },
  mounted() {
      this.custom_image === this.images.custom_image
    //   if (this.type === 'personal' && this.mode === 'form') document.querySelector('.clipper-range > div').style.width = "140px";
      if (this.mode === 'order' || this.mode === 'cart') {
          utils.setShape(this.$refs.player.querySelector('.form__spotify-player__image'), this.shape)
      }
      if (this.mode === 'order' && this.type === 'personal') {
          setTimeout(() => {
            this.$refs.clipper.setTL$.next(this.drawPos)
            this.$refs.clipper.setWH$.next(this.scale)
            setTimeout(() => {
                document.querySelector('.js-clipper-fixed').hidden = true
            }, 100)
          }, 200)
        }
    if (this.mode === 'cart' && this.type === 'personal') {
        AWS.getObj(this.custom_image, false, 'soundsonner-data-tmp').then((data) => {
            this.custom_image = data.custom_image
            setTimeout(() => {
                this.$refs.clipper.setTL$.next(this.drawPos)
                this.$refs.clipper.setWH$.next(this.scale)
                setTimeout(() => {
                    document.querySelector('.js-clipper-fixed').hidden = true
                }, 100)
            }, 200)
        })
    }
    this.filterTitleAndArtist()
  },
  methods: {
      setClipper() {
        setTimeout(() => {
            document.querySelector('.vuejs-clipper-fixed__img-center')?.style?.setProperty("top", "51%", "important")
            this.$refs.clipper.onChange$.subscribe((e) => {
                if (typeof e  === 'number') window.scale = e
                if (typeof e  === 'object') window.drawPos = e
            })
            // document.querySelector('.clipper-range > div').style.width = "140px";
        }, 10)
      },
      imgLoad() {
          if (this.inited && typeof this.custom_image === 'string') {
              const imageHeight = document.querySelector('.vuejs-clipper-fixed__img.js-img').clientHeight
              const wrapperHeight = document.querySelector('.vuejs-clipper-fixed__wrap.js-wrap').clientHeight
              if (wrapperHeight > imageHeight) {
                  this.$refs.clipper.setWH$.next(wrapperHeight / imageHeight)
              }
          }
          this.inited = true
      },
      zoom(plus) {
        //   const val = parseInt(e.target.value) / 100
          this.$refs.clipper.setWH$.next(plus ? window.scale + 0.1 : window.scale - 0.1)
      },
      filterTitleAndArtist() {
          if (this.song_title.length > 76) this.filteredTitle = this.song_title.substring(0, 76) + '...'
          else this.filteredTitle = this.song_title
          if (this.song_artist.length > 78) this.filteredArtist = this.song_artist.substring(0, 78) + '...'
          else this.filteredArtist = this.song_artist
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input[type=range] {
  width: 100%;
  margin: 12px 0;
  background-color: transparent;
  -webkit-appearance: none;
}
input[type=range]:focus {
  outline: none;
}
input[type=range]::-webkit-slider-runnable-track {
  background: #3071a9;
  border: 0;
  border-radius: 2.8px;
  width: 100%;
  height: 2px;
  cursor: pointer;
}
input[type=range]::-webkit-slider-thumb {
  margin-top: -12px;
  width: 10px;
  height: 26px;
  background: #ffffff;
  border: 1px solid #000000;
  cursor: pointer;
  -webkit-appearance: none;
}
input[type=range]:focus::-webkit-slider-runnable-track {
  background: #367ebd;
}
input[type=range]::-moz-range-track {
  background: #3071a9;
  border: 0;
  border-radius: 2.8px;
  width: 100%;
  height: 2px;
  cursor: pointer;
}
input[type=range]::-moz-range-thumb {
  width: 10px;
  height: 26px;
  background: #ffffff;
  border: 1px solid #000000;
  cursor: pointer;
}
input[type=range]::-ms-track {
  background: transparent;
  border-color: transparent;
  border-width: 17px 0;
  color: transparent;
  width: 100%;
  height: 2px;
  cursor: pointer;
}
input[type=range]::-ms-fill-lower {
  background: #2a6495;
  border: 0;
  border-radius: 5.6px;
}
input[type=range]::-ms-fill-upper {
  background: #3071a9;
  border: 0;
  border-radius: 5.6px;
}
input[type=range]::-ms-thumb {
  width: 10px;
  height: 26px;
  background: #ffffff;
  border: 1px solid #000000;
  cursor: pointer;
  margin-top: 0px;
  /*Needed to keep the Edge thumb centred*/
}
input[type=range]:focus::-ms-fill-lower {
  background: #3071a9;
}
input[type=range]:focus::-ms-fill-upper {
  background: #367ebd;
}
/*TODO: Use one of the selectors from https://stackoverflow.com/a/20541859/7077589 and figure out
how to remove the virtical space around the range input in IE*/
@supports (-ms-ime-align:auto) {
  /* Pre-Chromium Edge only styles, selector taken from hhttps://stackoverflow.com/a/32202953/7077589 */
  input[type=range] {
    margin: 0;
    /*Edge starts the margin from the thumb, not the track as other browsers do*/
  }
}


.controls {
    display: flex;
    align-items: center;
    max-width: 450px;
    justify-content: center;
    padding: 5px;
    /* padding-left: 18px; */
}
.controls-zoom {
    display: flex;
    justify-content: center;
    align-items: center;
}
.controls-zoom__button {
    width: 100%;
    display: flex;
    height: 40px;
}

.controls-zoom__button button {
    width: 100%;
    color: black;
    border: 1px solid #e3e3e3;
    border-bottom: none;
    background-color: #ebebebdc;
    cursor: pointer;
    font-size: 33px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.controls-zoom__button button:hover {
    background-color: #bdbcbc;
}
.controls-zoom > span {
    padding-right: 8px;
}
.clipper-rage-container {
    display: flex;
    align-items: center;
}
.vuejs-clipper-fixed__img-center {
    top: 51% !important;
}
.my-clipper {
  width: 100%;
  height: 101%;
  max-width: 700px;
}
.upload-image-button {
    cursor: pointer;
    width: 150px;
    border-radius: 25px;
    border: 2px solid #E8E8E8;
    background-color: #0A3333;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    padding-bottom: 2px;
    font-size: 16px;
}

.watermark-logo::before {
    content: "";
    z-index: 9;
    pointer-events:none;
    background-size: 775px;
    position: absolute;
    max-width: 775px;
    margin-left: -166px;
    /* margin-top: 135px; */
    width: 765px;
    height: 730px;
    opacity: 0.08;
    transform: rotate(-64deg);
    background-position: center;
    background-repeat: no-repeat;
    background-image: url("data:image/svg+xml,%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' x='0' y='0' viewBox='0 0 428.04 55.97' xml:space='preserve'%3E%3Cstyle%3E.st1%7Bfill:%2301756f%7D.st2%7Bstroke:%23000;stroke-miterlimit:10%7D%3C/style%3E%3Cpath fill='none' d='M53.53 11.53H432V51H53.53z'/%3E%3Cpath class='st1' d='M57.48 13.29h12.85c3.14 0 5.92.61 8.36 1.83 2.44 1.22 4.33 2.94 5.67 5.17 1.34 2.23 2.02 4.8 2.02 7.71s-.67 5.48-2.02 7.71c-1.34 2.23-3.23 3.95-5.67 5.17-2.44 1.22-5.22 1.83-8.36 1.83H57.48V13.29zm12.6 24.78c2.16 0 4.05-.41 5.69-1.24 1.64-.83 2.9-2 3.78-3.53.88-1.53 1.32-3.3 1.32-5.31 0-2.02-.44-3.79-1.32-5.31-.88-1.53-2.14-2.7-3.78-3.53-1.64-.83-3.54-1.24-5.69-1.24h-7.14v20.16h7.14zM112.66 33.16h-17.6c.31 1.65 1.11 2.96 2.42 3.93 1.3.97 2.92 1.45 4.85 1.45 2.46 0 4.49-.81 6.09-2.44l2.81 3.23c-1.01 1.2-2.28 2.11-3.82 2.73-1.54.62-3.28.92-5.21.92-2.46 0-4.63-.49-6.51-1.47s-3.33-2.35-4.35-4.1c-1.02-1.75-1.53-3.73-1.53-5.94 0-2.18.5-4.15 1.49-5.9s2.37-3.11 4.14-4.09c1.76-.98 3.75-1.47 5.96-1.47 2.18 0 4.14.48 5.86 1.45 1.72.97 3.07 2.32 4.03 4.07.97 1.75 1.45 3.77 1.45 6.07.01.37-.02.89-.08 1.56zM97.14 25.7c-1.16.99-1.87 2.32-2.12 3.97h12.73c-.22-1.62-.91-2.94-2.06-3.95-1.15-1.01-2.58-1.51-4.28-1.51-1.68 0-3.1.5-4.27 1.49zM139.75 11.53v31.16h-5.04v-2.9a8.165 8.165 0 01-3.21 2.39c-1.27.53-2.68.8-4.22.8-2.16 0-4.1-.48-5.82-1.43-1.72-.95-3.07-2.3-4.05-4.05s-1.47-3.76-1.47-6.03.49-4.27 1.47-6.01c.98-1.74 2.33-3.08 4.05-4.03 1.72-.95 3.66-1.43 5.82-1.43 1.48 0 2.84.25 4.07.76 1.23.5 2.28 1.26 3.15 2.27v-11.5h5.25zm-8.44 26.1c1.01-.57 1.81-1.39 2.39-2.46.59-1.06.88-2.3.88-3.7 0-1.4-.29-2.63-.88-3.7-.59-1.06-1.39-1.88-2.39-2.46-1.01-.57-2.14-.86-3.4-.86-1.26 0-2.39.29-3.4.86-1.01.57-1.81 1.39-2.39 2.46-.59 1.06-.88 2.3-.88 3.7 0 1.4.29 2.63.88 3.7.59 1.06 1.39 1.88 2.39 2.46 1.01.57 2.14.86 3.4.86 1.26 0 2.39-.28 3.4-.86zM146.89 15.67c-.64-.6-.97-1.35-.97-2.25 0-.9.32-1.64.97-2.25.64-.6 1.44-.9 2.39-.9.95 0 1.75.29 2.39.86.64.57.97 1.3.97 2.16 0 .92-.32 1.7-.95 2.33-.63.63-1.44.94-2.42.94-.94.01-1.73-.29-2.38-.89zm-.25 4.59h5.25v22.43h-5.25V20.26zM162.81 41.52c-1.85-.98-3.29-2.35-4.33-4.1-1.04-1.75-1.55-3.73-1.55-5.94s.52-4.19 1.55-5.92c1.04-1.74 2.47-3.09 4.31-4.07 1.83-.98 3.93-1.47 6.28-1.47 2.21 0 4.15.45 5.82 1.34 1.67.9 2.92 2.18 3.76 3.86l-4.03 2.35c-.64-1.04-1.45-1.81-2.42-2.33s-2.02-.78-3.17-.78c-1.96 0-3.58.64-4.87 1.91s-1.93 2.98-1.93 5.1.64 3.83 1.91 5.1c1.27 1.27 2.9 1.91 4.89 1.91 1.15 0 2.21-.26 3.17-.78.97-.52 1.77-1.29 2.42-2.33l4.03 2.35a9.142 9.142 0 01-3.8 3.89c-1.67.91-3.59 1.36-5.77 1.36-2.34.02-4.42-.47-6.27-1.45zM199.33 22.38c1.75 1.58 2.62 3.97 2.62 7.16v13.15H197v-2.73c-.64.98-1.56 1.73-2.75 2.25s-2.62.78-4.31.78-3.15-.29-4.41-.86c-1.26-.57-2.23-1.37-2.92-2.39s-1.03-2.18-1.03-3.46c0-2.02.75-3.63 2.25-4.85 1.5-1.22 3.86-1.83 7.08-1.83h5.8v-.34c0-1.57-.47-2.77-1.41-3.61-.94-.84-2.33-1.26-4.18-1.26-1.26 0-2.5.2-3.72.59-1.22.39-2.25.94-3.09 1.64l-2.06-3.82c1.18-.9 2.59-1.58 4.24-2.06 1.65-.48 3.4-.71 5.25-.71 3.31-.02 5.84.77 7.59 2.35zm-4.79 15.88c1.02-.6 1.74-1.46 2.16-2.58v-2.6h-5.42c-3.02 0-4.54.99-4.54 2.98 0 .95.38 1.71 1.13 2.27.76.56 1.81.84 3.15.84 1.33-.01 2.5-.31 3.52-.91z'/%3E%3Cpath d='M222.16 41.47c-.62.5-1.36.88-2.25 1.13-.88.25-1.81.38-2.79.38-2.46 0-4.37-.64-5.71-1.93-1.34-1.29-2.02-3.16-2.02-5.63V24.63h-3.7v-4.2h3.7v-5.12h5.25v5.12h6.01v4.2h-6.01V35.3c0 1.09.27 1.93.8 2.5.53.57 1.3.86 2.31.86 1.18 0 2.16-.31 2.94-.92l1.47 3.73zM248.2 20.26v22.43h-5v-2.86a8.27 8.27 0 01-3.15 2.33c-1.26.55-2.62.82-4.07.82-3 0-5.35-.83-7.08-2.5-1.72-1.67-2.58-4.14-2.58-7.41V20.26h5.25v12.1c0 2.02.46 3.52 1.37 4.52.91.99 2.21 1.49 3.88 1.49 1.88 0 3.37-.58 4.47-1.74 1.11-1.16 1.66-2.83 1.66-5.02V20.26h5.25z'/%3E%3Cpath class='st1' d='M259.12 41.52c-1.85-.98-3.29-2.35-4.33-4.1-1.04-1.75-1.55-3.73-1.55-5.94s.52-4.19 1.55-5.92c1.04-1.74 2.47-3.09 4.31-4.07 1.83-.98 3.93-1.47 6.28-1.47 2.21 0 4.15.45 5.82 1.34 1.67.9 2.92 2.18 3.76 3.86l-4.03 2.35c-.64-1.04-1.45-1.81-2.42-2.33s-2.02-.78-3.17-.78c-1.96 0-3.58.64-4.87 1.91s-1.93 2.98-1.93 5.1.64 3.83 1.91 5.1c1.27 1.27 2.9 1.91 4.89 1.91 1.15 0 2.21-.26 3.17-.78.97-.52 1.77-1.29 2.42-2.33l4.03 2.35a9.142 9.142 0 01-3.8 3.89c-1.67.91-3.59 1.36-5.77 1.36-2.34.02-4.43-.47-6.27-1.45zM295.63 22.38c1.75 1.58 2.62 3.97 2.62 7.16v13.15h-4.96v-2.73c-.64.98-1.56 1.73-2.75 2.25s-2.62.78-4.31.78-3.15-.29-4.41-.86c-1.26-.57-2.23-1.37-2.92-2.39s-1.03-2.18-1.03-3.46c0-2.02.75-3.63 2.25-4.85 1.5-1.22 3.86-1.83 7.08-1.83h5.8v-.34c0-1.57-.47-2.77-1.41-3.61-.94-.84-2.33-1.26-4.18-1.26-1.26 0-2.5.2-3.72.59-1.22.39-2.25.94-3.09 1.64l-2.06-3.82c1.18-.9 2.59-1.58 4.24-2.06 1.65-.48 3.4-.71 5.25-.71 3.33-.02 5.85.77 7.6 2.35zm-4.78 15.88c1.02-.6 1.74-1.46 2.16-2.58v-2.6h-5.42c-3.02 0-4.54.99-4.54 2.98 0 .95.38 1.71 1.13 2.27.76.56 1.81.84 3.15.84 1.33-.01 2.49-.31 3.52-.91zM324.51 22.49c1.71 1.65 2.56 4.1 2.56 7.35v12.85h-5.25V30.51c0-1.96-.46-3.44-1.39-4.43-.92-.99-2.24-1.49-3.95-1.49-1.93 0-3.46.58-4.58 1.74-1.12 1.16-1.68 2.83-1.68 5.02v11.34h-5.25V20.26h5v2.9c.87-1.04 1.96-1.82 3.28-2.35 1.32-.53 2.8-.8 4.45-.8 2.83 0 5.1.83 6.81 2.48zM337.99 41.52c-1.85-.98-3.29-2.35-4.33-4.1-1.04-1.75-1.55-3.73-1.55-5.94s.52-4.19 1.55-5.92c1.04-1.74 2.47-3.09 4.31-4.07 1.83-.98 3.93-1.47 6.28-1.47 2.21 0 4.15.45 5.82 1.34 1.67.9 2.92 2.18 3.76 3.86l-4.03 2.35c-.64-1.04-1.45-1.81-2.42-2.33s-2.02-.78-3.17-.78c-1.96 0-3.58.64-4.87 1.91s-1.93 2.98-1.93 5.1.64 3.83 1.91 5.1c1.27 1.27 2.9 1.91 4.89 1.91 1.15 0 2.21-.26 3.17-.78.97-.52 1.77-1.29 2.42-2.33l4.03 2.35a9.142 9.142 0 01-3.8 3.89c-1.67.91-3.59 1.36-5.77 1.36-2.34.02-4.42-.47-6.27-1.45zM358.61 15.67c-.64-.6-.97-1.35-.97-2.25 0-.9.32-1.64.97-2.25.64-.6 1.44-.9 2.39-.9.95 0 1.75.29 2.39.86.64.57.97 1.3.97 2.16 0 .92-.32 1.7-.95 2.33-.63.63-1.44.94-2.42.94-.94.01-1.73-.29-2.38-.89zm-.25 4.59h5.25v22.43h-5.25V20.26zM374.45 41.52c-1.82-.98-3.24-2.35-4.26-4.1-1.02-1.75-1.53-3.73-1.53-5.94s.51-4.19 1.53-5.92c1.02-1.74 2.44-3.09 4.26-4.07 1.82-.98 3.86-1.47 6.13-1.47 2.3 0 4.35.49 6.17 1.47 1.82.98 3.24 2.34 4.26 4.07 1.02 1.74 1.53 3.71 1.53 5.92s-.51 4.19-1.53 5.94-2.44 3.12-4.26 4.1c-1.82.98-3.88 1.47-6.17 1.47-2.27 0-4.31-.49-6.13-1.47zm10.92-4.96c1.26-1.29 1.89-2.98 1.89-5.08s-.63-3.79-1.89-5.08c-1.26-1.29-2.86-1.93-4.79-1.93s-3.52.64-4.77 1.93c-1.25 1.29-1.87 2.98-1.87 5.08s.62 3.79 1.87 5.08 2.83 1.93 4.77 1.93 3.53-.64 4.79-1.93zm-2.69-25.12h6.17l-7.31 5.75H377l5.68-5.75zM417.12 22.49c1.71 1.65 2.56 4.1 2.56 7.35v12.85h-5.25V30.51c0-1.96-.46-3.44-1.39-4.43-.92-.99-2.24-1.49-3.95-1.49-1.93 0-3.46.58-4.58 1.74-1.12 1.16-1.68 2.83-1.68 5.02v11.34h-5.25V20.26h5v2.9c.87-1.04 1.96-1.82 3.28-2.35 1.32-.53 2.8-.8 4.45-.8 2.83 0 5.1.83 6.81 2.48z'/%3E%3Cpath class='st2' d='M39.13 10.1h.13c1.12 0 2.02.91 2.02 2.02v32.27c0 1.12-.91 2.02-2.02 2.02h-.13a2.02 2.02 0 01-2.02-2.02V12.12c-.01-1.12.9-2.02 2.02-2.02zM17.69 44.49V12.12c0-1.12.91-2.02 2.02-2.02h.08c1.12 0 2.02.91 2.02 2.02v32.36c0 .99-.71 1.83-1.68 1.99l-.08.01c-1.23.22-2.36-.73-2.36-1.99zM29.4 12.62h.23c1.12 0 2.02.91 2.02 2.02v27.22c0 1.12-.91 2.02-2.02 2.02h-.23a2.02 2.02 0 01-2.02-2.02V14.65c0-1.12.9-2.03 2.02-2.03zM48.91 14.87l.19.01c1.07.06 1.9.95 1.9 2.02v22.7c0 1.05-.81 1.93-1.85 2.02l-.19.02a2.02 2.02 0 01-2.19-2.02V16.89c0-1.16.98-2.09 2.14-2.02zM11.12 36.65a2.02 2.02 0 01-2.02-2.02V21.88a2.02 2.02 0 014.04 0v12.74c0 1.12-.91 2.03-2.02 2.03z'/%3E%3C/svg%3E");
}

.border-none {
    border: none !important;
}

@media only screen and (max-width: 1000px) {
    .watermark-logo::before {
        background-size: 707px;
        position: absolute;
        max-width: none;
        margin-top: 250px;
        margin-left: -168px;
        width: 750px;
        height: 200px;
    }
}
@media only screen and (max-width: 470px) {
    .watermark-logo::before {
        background-size: 154vw;
        position: absolute;
        max-width: 165vw;
        margin-top: 67vw;
        margin-left: -30vw;
        width: 150vw;
        height: 28vw;
    }
}

</style>
