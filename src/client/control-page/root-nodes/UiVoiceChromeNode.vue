<template lang='pug'>

</template>


<script>
export default {
  data() {
    return {};
  },
  mounted() {
    //subsribe events
    this.$options.sockets.uiVoiceChromeNode = data => {
      let msg = new SpeechSynthesisUtterance(data);
      speechSynthesis.speak(msg);
    };
  },
  beforeDestroy() {
    //unsubsribe
    delete this.$options.sockets.uiVoiceChromeNode;
  }
};
</script>
