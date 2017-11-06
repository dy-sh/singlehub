<template lang='pug'>

</template>


<script>
export default {
  data() {
    return {
      audioSpeech: new Audio(),
      playlist: [],
      apikey: ""
    };
  },
  mounted() {
    //subsribe events
    this.$options.sockets.uiVoiceYandexNode = data => {
      console.log(data);
      this.apikey = data.key;
      // this.playlist.push(data.text);
      // if (this.audioSpeech.paused) this.playNextTrack();
      this.play(data.text);
    };
  },
  beforeDestroy() {
    //unsubsribe
    delete this.$options.sockets.uiVoiceYandexNode;
  },
  methods: {
    playNextTrack() {
      if (this.playlist.length == 0) return;

      let text = this.playlist.shift();

      if (!this.apikey) {
        this.debugErr("Please, set api-key in node settings.");
        return;
      }

      let url =
        "https://tts.voicetech.yandex.net/generate?key=" +
        this.apikey +
        "&text=" +
        text;

      this.audioSpeech.src = url;
      this.audioSpeech.load();
      this.audioSpeech.play();
    },
    play(text) {
      if (!this.apikey) {
        this.debugErr("Please, set api-key in node settings.");
        return;
      }

      let url =
        "https://tts.voicetech.yandex.net/generate?key=" +
        this.apikey +
        "&text=" +
        text;

      this.audioSpeech.src = url;
      this.audioSpeech.load();
      this.audioSpeech.play();
    }
  }
};
</script>
