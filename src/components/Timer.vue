<template>
  <div class="timer">
    <h1>{{ counter }}</h1>
  </div>
</template>

<script>
export default {
  name: 'Timer',
  props: {
  },
  emits: ['finish'],
  data() {
    return {
      counter: 1
    }
  },
  methods: {
    start() {
      const downloadTimer = setInterval(() => {
        if (this.counter <= 1) {
          clearInterval(downloadTimer);
          this.$emit('finish')
        }
        this.counter -= 1;
      }, 1000);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.timer {
}
</style>
