<template>
  <div class="editor">
    <button type="button" class="soundsonner-edit-button" @click="openModal">Editar canción</button>
    <div class="modal-soundsonner" ref="myModal">
      <div class="modal-soundsonner-content">
        <div class="modal-soundsonner-header">
          <span class="close" @click="closeModal">&times;</span>
        </div>
        <div class="modal-soundsonner-body">
            <Form ref="form" />
        </div>
        <div class="modal-soundsonner-footer">
            <button type="button" @click="save"
            >Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import AWS from '../services/s3.service'
import Form from './Form.vue'

export default {
  name: "Editor",
  components: {
      Form
  },
  props: {
    order: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
        amazonObj: {}
    };
  },
  mounted() {
  },
  methods: {
      openModal() {
        AWS.getObj(this.order, false).then((json) => {
            this.$refs.myModal.style.display = 'block'
            this.amazonObj = json
            this.$refs.form.setValuesFromEditor(this.amazonObj)
        })
      },
      closeModal() {
          this.$refs.myModal.style.display = 'none'
      },
      save() {
          if (window.soundsoner) {
              this.amazonObj.soundsonner = window.soundsoner
              AWS.saveObj(this.order, this.amazonObj).then(() => {
                  this.closeModal()
              })
          }
      }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.editor {
    display: flex;
    justify-content: center;
    padding-bottom: 10px;
}
.soundsonner-edit-button {
    background-color: #4CAF50; /* Green */
    border: none;
    color: white;
    padding: 10px 16px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 13px;
    cursor: pointer;
    margin: 0px 4px;
}
/* The Modal (background) */
.modal-soundsonner {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 9999; /* Sit on top */
  padding-top: 100px; /* Location of the box */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

/* Modal Content */
.modal-soundsonner-content {
  position: relative;
  background-color: #fefefe;
  margin: auto;
  padding: 0;
  border: 1px solid #888;
  width: 80%;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  -webkit-animation-name: animatetop;
  -webkit-animation-duration: 0.4s;
  animation-name: animatetop;
  animation-duration: 0.4s;
}

/* Add Animation */
@-webkit-keyframes animatetop {
  from {
    top: -300px;
    opacity: 0;
  }
  to {
    top: 0;
    opacity: 1;
  }
}

@keyframes animatetop {
  from {
    top: -300px;
    opacity: 0;
  }
  to {
    top: 0;
    opacity: 1;
  }
}

/* The Close Button */
.close {
  color: white;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: #000;
  text-decoration: none;
  cursor: pointer;
}

.modal-soundsonner-header {
  padding: 2px 16px;
  height: 45px;
  background-color: #5cb85c;
  color: white;
}

.modal-soundsonner-body {
  padding: 2px 16px;
}

.modal-soundsonner-footer {
  padding: 20px 16px;
  background-color: #5cb85c;
  color: white;
  text-align: center;
}
.modal-soundsonner-footer button {
    background-color: #008CBA; /* Green */
    border: none;
    color: white;
    padding: 16px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    transition-duration: 0.4s;
    cursor: pointer;
    margin: auto;
}
</style>
