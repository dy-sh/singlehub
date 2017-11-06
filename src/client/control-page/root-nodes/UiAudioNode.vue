<template lang='pug'>

</template>


<script>
// let audio = new Audio();

export default {
  data() {
    return {
      audio: new Audio()
    };
  },
  mounted() {
    //subsribe events
    this.$options.sockets.uiAudioNode = data => {
      console.log("UiAudioNode", data);
      this.play(data.url, data.play);
    };
  },
  methods: {
    play(url, play) {
      if (!this.audio.paused) this.audio.pause();

      // if (url) {
      this.audio.src = url;
      this.audio.load();
      // }

      if (play) this.audio.play();
    }
  },
  beforeDestroy() {
    //unsubsribe
    delete this.$options.sockets.uiAudioNode;
  }
};
</script>
