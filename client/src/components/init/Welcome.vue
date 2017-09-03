<template lang='pug'>
  div
    main
      v-content
        v-container(fluid='')
          v-slide-y-transition(mode='out-in')
            v-layout(column align-center)
              h4 First Run
              v-stepper.grey.darken-3(v-model='e1')
                v-stepper-header(color='grey lighten-1')
                  v-stepper-step(step='1', :complete='e1 > 1') Welcome
                  v-divider
                  v-stepper-step(step='2', :complete='e1 > 2') Database
                  v-divider
                  v-stepper-step(step='3') User
                v-stepper-content(step='1')
                  v-card(color='grey darken-3')
                    h5 Welcome to SingleHub
                    p This is the initial settings wizard.
                    p You will be offered the following steps:
                      ul
                        li Configure database
                        li Create Admin profile
                  .text-xs-center      
                    v-btn(color='primary', @click.native='e1 = 2' flat) Well, let's start
                  //- v-btn(flat='') Cancel
                v-stepper-content(step='2')
                  v-card(color='grey darken-4', height='200px')
                    h5 Welcome to SingleHub
                      p This is the initial settings wizard.
                      p You will be offered the following steps:
                        ul
                          li Configure database
                          li Create Admin profile
                  v-btn(color='primary', @click.native='e1 = 3') Continue
                  v-btn(flat='') Cancel
                v-stepper-content(step='3')
                  v-card(color='blue-grey darken-4', height='200px')
                    h5 Welcome to SingleHub
                      p This is the initial settings wizard.
                      p You will be offered the following steps:
                        ul
                          li Configure database
                          li Create Admin profile
                  v-btn(color='primary', @click.native='e1 = 1') Continue
                  v-btn(flat='') Cancel
</template>


<script>
export default {
  data() {
    return {
      e1: 0
    };
  }
};
</script>


<style scoped>
.card {
  margin-bottom: 20px;
  padding: 20px;
  width: 400px;
  height: 200px;
}
</style>