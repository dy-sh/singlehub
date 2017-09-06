<template lang='pug'>
main
  v-content    
    v-container(grid-list-xl)
      v-layout(row wrap)
        v-flex(xs12 sm10 md8 offset-xs0 offset-sm1 offset-md2)
          //- v-card(dark color='green')
          v-card(color='grey darken-3')
            v-toolbar(color='blue darken-2' dense)
              v-toolbar-title Welcome to SingleHub
              v-spacer
              v-btn(dark icon)
                v-icon view_module
            v-card-text
              //- h5.text-xs-center Welcome to SingleHub
              p This is the initial settings wizard.
              p You will be offered the following steps:
                ul
                  li Configure database
                  li Create Admin profile
            .text-xs-center.pb-3    
              v-btn(color='blue darken-2', @click.native='e1 = 2') Well, let's start
        

    //- main
    //-   v-content
    //-     v-container(grid-list-xl text-xs-center)
    //-       v-layout(row wrap)
    //-         v-flex(xs10 offset-xs1)
    //-           v-card(dark color='purple')
    //-             v-card-text xs10 offset-xs1
    //-             v-card-text xs10 offset-xs1
        //- v-container
        //-   v-slide-y-transition(mode='out-in')
        //-     v-layout(column align-center)
        //-       h4 First Run
        //-       v-stepper.grey.darken-3(v-model='e1')
        //-         v-stepper-header.grey.darken-2
        //-           v-stepper-step(step='1', :complete='e1 > 1') Welcome
        //-           v-divider
        //-           v-stepper-step(step='2', :complete='e1 > 2') Database
        //-           v-divider
        //-           v-stepper-step(step='3') User
        //-         v-stepper-content(step='1')
        //-           v-card(color='grey darken-3')
        //-             h5.text-xs-center Welcome to SingleHub
        //-             p This is the initial settings wizard.
        //-             p You will be offered the following steps:
        //-               ul
        //-                 li Configure database
        //-                 li Create Admin profile
        //-           .text-xs-center      
        //-             v-btn(color='grey darken-1', @click.native='e1 = 2') Well, let's start
        //-           //- v-btn(flat='') Cancel
        //-         v-stepper-content(step='2')
        //-           v-card(color='grey darken-3')
        //-             h5 Welcome to SingleHub
        //-             p This is the initial settings wizard.
        //-             p You will be offered the following steps:
        //-               ul
        //-                 li Configure database
        //-                 li Create Admin profile
        //-           .text-xs-center        
        //-             v-btn(@click.native='e1 = 1' flat) Back
        //-             v-btn(color='grey darken-1', @click.native='e1 = 3') Continue
        //-         v-stepper-content(step='3')
        //-           v-card(color='blue-grey darken-4', height='200px')
        //-             h5 Welcome to SingleHub
        //-               p This is the initial settings wizard.
        //-               p You will be offered the following steps:
        //-                 ul
        //-                   li Configure database
        //-                   li Create Admin profile
        //-           v-btn(color='primary', @click.native='e1 = 1') Continue
        //-           v-btn(flat='') Cancel
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
/* .card {
  margin-bottom: 20px;
  padding: 20px;
  width: 600px;
  height: 200px;
} */
</style>