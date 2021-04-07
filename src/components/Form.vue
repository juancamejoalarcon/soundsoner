<template>
    <div class="form" ref="form">
        <div class="form__container">
            <div class="form__row">
                <div class="form__tabs">
                    <div class="form__tabs__radio">
                        <label>
                            <input type="radio" name="radio" checked @click="type = 'spotify'">
                            <div>
                                <img :src="images.spotify_icon">
                                CANCIÓN
                            </div>
                        </label>
                    </div>
                    <div class="form__tabs__radio">
                        <label>
                            <input type="radio" name="radio" @click="type = 'personal'">
                            <div>
                                <img :src="images.yourimage_icon">
                                TU PROPIA IMAGEN
                            </div>
                        </label>
                    </div>
                </div>
                <div class="form__inputs">
                    <div class="form__inputs__container">
                        <div class="form__inputs__text">
                            <input type="text" placeholder="Canción, artista álbum" 
                                @focus="display_list = true" 
                                @blur="onBlur"
                                @input="search" 
                                @change="search" 
                                v-model="searchInput"
                                ref="search">
                            <svg class="spinner" viewBox="0 0 50 50" v-if="loading_spoti">
                                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                            </svg>
                            <div class="form__inputs__text__songs" v-if="display_list">
                                <div class="form__inputs__text__songs__container">
                                    <div class="form__inputs__text__songs__song" v-for="item in items" :key="item.id" @click="selectSong(item)">
                                        <img :src="item.album.images[0].url">
                                        <div class="form__inputs__text__songs__song__info">
                                            <div class="form__inputs__text__songs__song__info__title">{{ item.name }}</div>
                                            <div class="form__inputs__text__songs__song__info__artist">{{ getArtists(item.artists) }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form__inputs__text">
                            <input type="text" placeholder="Título de la canción" v-model="song_title" @input="setWindowObj">
                        </div>
                        <div class="form__inputs__text">
                            <input type="text" placeholder="Nombre del artista" v-model="song_artist" @input="setWindowObj">
                        </div>
                        <div class="form__inputs__text" v-if="type === 'personal'" ref="inputImage">
                            <clipper-upload v-model="custom_image">
                                <div class="upload-image-button">
                                    Cargar imagen
                                </div>
                            </clipper-upload>
                            <!-- <label>
                                <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" @change="uploadImage">
                                Choose a profile picture:
                            </label> -->
                        </div>
                    </div>
                </div>
                <div class="form__player__container" v-if="isMobile">
                <Player
                    :type="type"
                    :custom_image="custom_image"
                    :soundwave="soundwave"
                    :song_title="song_title"
                    :song_artist="song_artist"
                    :album_image="album_image"
                    :images="images"
                    :shape="shape"
                    :watermark="watermark"
                    :mode="'form'"
                />
                </div>
                <div class="form__shapes">
                    <div class="form__shapes__container">
                        <h2>Seleccionar versión</h2>
                        <div class="form__shapes__row">
                            <div class="form__shapes__shape">
                                <label >
                                    <input type="radio" name="shape1" value="classic" :checked="shape ==='classic'" @change="setShape">
                                    <!-- <div>Clásico</div> -->
                                    <img :src="images.square" :class="{'checked-icon': shape ==='classic'}">
                                </label>
                            </div>
                            <div class="form__shapes__shape">
                                <label >
                                    <input type="radio" name="shape1" value="heart" :checked="shape ==='heart'" @change="setShape">
                                    <!-- <div>Corazón</div> -->
                                    <img :src="images.heart" :class="{'checked-icon': shape ==='heart'}">
                                </label>
                            </div>
                            <div class="form__shapes__shape">
                                <label >
                                    <input type="radio" name="shape1" value="circle" :checked="shape ==='circle'" @change="setShape">
                                    <!-- <div>Círculo</div> -->
                                    <img :src="images.circle" :class="{'checked-icon': shape ==='circle'}">
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form__row" v-if="!isMobile">
                <Player
                    :type="type"
                    :custom_image="custom_image"
                    :soundwave="soundwave"
                    :song_title="song_title"
                    :song_artist="song_artist"
                    :album_image="album_image"
                    :images="images"
                    :shape="shape"
                    :watermark="watermark"
                    :mode="'form'"
                />
            </div>
        </div>
    </div>
</template>

<script>
import imageCompression from 'browser-image-compression';
import { debounce } from "debounce";
import spotifyService from '../services/spotify.service'
import AWS from '../services/s3.service'
import utils from '../services/utilis.service'
import images from '../services/images'
import Player from './Player'

export default {
  name: 'Form',
  components: {
      Player
  },
  props: {
  },
  data() {
      return {
          images,
          type: 'spotify',
          display_list: false,
          searchInput: '',
          items: [],
          tracks: {},
          album_image: images.default,
          soundwave: images.soundwave,
          song_title: '',
          song_artist: '',
          song_id: '',
          shape: 'classic',
          custom_image: images.default,
          isMobile: window.innerWidth < 1000,
          watermark: true,
          loading_spoti: false,
      }
  },
    watch: { 
        type: function (newVal) {
            if (newVal === 'personal') {
                this.setInputImage()
            }
        }
    },
  mounted() {
      window.getImageFronDiv = () => {
        return new Promise((resolve) => {
            if (this.type === 'personal') {
                window.showHideSpinner()
                const identifier = '_' + Math.random().toString(36).substr(2, 9);
                AWS.saveObj(identifier, { custom_image: window.custom_image }, 'soundsonner-data-tmp').then(() => {
                    this.setWindowObj(identifier)
                    resolve()
                 })
            } else {
                this.setWindowObj()
                resolve()
            }
        })
      };
      window.soundsonnerToastError = (error) => {
          this.$toasted.show(error, { 
              theme: "bubble", 
              position: "bottom-center", 
              duration : 5000,
              fullWidth: true
            });
      }
      window.addEventListener('resize', this.onResize)
      // remove watermark on wp-admin
      if (window.location.href.indexOf("wp-admin") != -1) this.watermark = false
  },
  methods: {
      onBlur() {
          setTimeout(() => { this.display_list = false }, 200);
      },
      setShape (e) {
          utils.setShape(this.$refs.form.querySelector('.form__spotify-player__image'), e.target.value)
          this.shape = e.target.value
          this.setWindowObj()
      },
      search: debounce(function (){
          if (this.searchInput) {
            this.loading_spoti = true
            spotifyService.getSpotify(this.searchInput).then((data) => {
                if (data.tracks) {
                    if (data.tracks.items) this.items = data.tracks.items
                    this.tracks = data.tracks
                }
            }).finally(() => {
                this.loading_spoti = false
            })
          }
    }, 200),
    getArtists (list) {
        return list.reduce((accumulator, currentValue, index) => {
            const artist = index ? ', ' + currentValue.name : currentValue.name
            return accumulator + artist
        }, '')
    },
    selectSong (item) {
        this.song_id = item.id
        this.soundwave = `https://scannables.scdn.co/uri/plain/png/FFFFFF/black/820/spotify:track:${item.id}`
        this.album_image = item.album.images[0].url
        this.song_artist = this.getArtists(item.artists)
        this.song_title = item.name
        this.searchInput = item.name
        this.setWindowObj()
    },
    setWindowObj (identifier = '') {
        window.soundsoner = {
            song_id: this.song_id,
            soundwave: this.soundwave,
            album_image: this.album_image,
            song_artist: this.song_artist,
            song_title: this.song_title,
            type: this.type,
            shape: this.shape,
            custom_image: identifier,
            drawPos: window.drawPos,
            scale: window.scale,
        }
    },
    setValuesFromEditor (obj) {
        for (const [key, value] of Object.entries(obj.soundsonner)) {
            this[key] = value
        }
        this.setWindowObj()
    },
    onResize() {
        this.isMobile = window.innerWidth < 1000
    },
    setInputImage() {
        setTimeout(() => {
            const input = this.$refs.form.querySelector('input[type="file"]')
            input.setAttribute("accept", "image/png, image/jpeg")
            input.addEventListener('change', this.onUploadImage)
        }, 50)
    },
    handleImageUpload(imageFile) {
        return new Promise((resolve, reject) => {

            var options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 2400,
                useWebWorker: true
            }
            imageCompression(imageFile, options)
                .then(function (compressedFile) {
                    resolve(compressedFile)
                })
                .catch(function (error) {
                    reject(error.message)
            });
        });
    },
    getBase64(file) {
        return new Promise((resolve, reject) => { 
            const sizeInMB = (file.size / (1024*1024)).toFixed(2);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // larger than 1mb reduce
                if (parseFloat(sizeInMB) > 1) {
                    this.handleImageUpload(file).then((compressedImageBlob) => {
                        var blobReader = new FileReader();
                        blobReader.readAsDataURL(compressedImageBlob); 
                        blobReader.onloadend = () => {
                            this.custom_image = blobReader.result
                            resolve(blobReader.result)
                        }
                    })
                } else {
                    resolve(reader.result)
                }
            };
            reader.onerror = function (error) {
              console.log('Error: ', error);
              reject()
            };
        })
    },
    onUploadImage() {
        window.showHideSpinner()
        const file = this.$refs.form.querySelector('input[type="file"]').files[0];
        this.getBase64(file).then((base64) => {
            window.showHideSpinner()
            window.custom_image = base64
        }).finally(() => {
            window.showHideSpinner(true)
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.form__shapes__shape img {
    padding: 0.5rem;
}
.checked-icon {
    border: 3px solid #01756f;
    background: #01756f69;
}
.my-clipper {
  width: 100%;
  height: 101%;
  max-width: 700px;
}
.upload-image-button {
    cursor: pointer;
    width: 220px;
    border-radius: 25px;
    border: 2px solid #E8E8E8;
    background-color: #0A3333;
    height: 54px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    padding-bottom: 2px;
    font-size: 16px;
}

.mask-image-classic {
    mask-image: 'none';
}

.form__player__container {
    background-color: white;
    padding: 2rem 0.25rem;
    border-left: 1px solid #dcdcdc;
    border-right: 1px solid #dcdcdc;
    display: flex;
    justify-content: center;
}

.form__player__container > .form__spotify-player {
    padding-right: 0px;
}

.spinner {
  animation: rotate 2s linear infinite;
  z-index: 2;
  position: absolute;
  width: 35px;
  height: 35px;
  margin-left: -44px;
  margin-top: 8px;
}

.spinner > .path {
    stroke: #01756f;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}


</style>
