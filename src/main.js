import Vue from 'vue'
import VueRx from 'vue-rx'
import App from './App.vue'
import './main.css'

import VuejsClipper from "vuejs-clipper/dist/vuejs-clipper.umd";
import "vuejs-clipper/dist/vuejs-clipper.css";

import Toasted from 'vue-toasted';

import AWS from './services/s3.service'



Vue.config.productionTip = false

Vue.use(VuejsClipper);
Vue.use(VueRx)
Vue.use(Toasted)

// wc_order_77foSntfDHe3B
const el = document.getElementById('soundsoner-root')
window.showHideSpinner = (forceHide = false) => {
  if (forceHide) document.querySelector('.loader-spinner').hidden = true
  else document.querySelector('.loader-spinner').hidden = !document.querySelector('.loader-spinner').hidden
}
if (el) {
  const type = el.getAttribute('type')
  const json = el.getAttribute('data-json')
  const order = el.getAttribute('data-order')
  if (type === 'order' | type === 'downloader') {
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('key');
    AWS.getObj(myParam).then((json) => {
      new Vue({
        el,
        data: {
          type,
          json
        },
        render: h => h(App)
      })
    })
  } else {
    new Vue({
      el,
      data: {
        type,
        json,
        order
      },
      render: h => h(App)
    })
  }
}