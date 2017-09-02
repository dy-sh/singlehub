<template lang="pug">
  v-app(light='')
    toolbar
    main
      v-content
        v-container(fluid='')
          v-slide-y-transition(mode='out-in')
            v-layout(column='', align-center='')
              img.mb-5(src='/public/v.png', alt='Vuetify.js')
              blockquote
                | “First, solve the problem. Then, write the code.”
                footer
                  small
                    em —John Johnson
</template>

<script>
import Toolbar from "./components/Toolbar.vue";

export default {
  components: {
    toolbar: Toolbar
  },
  data() {
    return {};
  }
};
</script>
