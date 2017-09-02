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
    v-footer(:fixed='fixed', app='')
      span SingleHub © 2017
 
</template>

<script>
export default {
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
      items: [{ icon: "bubble_chart", title: "Inspire" }],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "Vuetify.js"
    };
  }
};
</script>
