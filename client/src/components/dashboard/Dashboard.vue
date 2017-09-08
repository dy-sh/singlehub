<template lang='pug'>
main
  v-content    
    v-container(grid-list-xl)
      v-layout(row wrap)
        v-flex(xs12 sm10 md6 offset-xs0 offset-sm1 offset-md3)
          v-card(color='grey darken-3')
            v-toolbar(color='blue darken-2' dense)
              v-toolbar-title My Device
              v-spacer
              v-toolbar-side-icon
            v-divider
            v-list(subheader)
              v-subheader Living room
              v-list-tile
                v-list-tile-content
                  v-list-tile-title Ligth
                  //- v-list-tile-sub-title Hangouts message
                v-spacer
                v-list-tile-action
                  v-switch(v-model="ex15" value="John")
              v-list-tile
                v-list-tile-content
                  v-list-tile-title Curtains
                  //- v-list-tile-sub-title Hangouts message
                v-spacer
                v-list-tile-action
                  v-btn(color='blue darken-2', @click='submit') ON   
            v-divider
            v-list(subheader)
              v-subheader Kitchen
              v-list-tile
                v-list-tile-content
                  v-list-tile-title Door
                  //- v-list-tile-sub-title Hangouts message
                v-spacer
                v-list-tile-action
                  v-switch(v-model="ex15" value="John")
              v-list-tile
                v-list-tile-content
                  v-list-tile-title Window
                  //- v-list-tile-sub-title Hangouts message
                v-spacer
                v-list-tile-action
                  v-btn(color='blue darken-2', @click='submit') ON  
      //- v-layout(row wrap)
      //-   v-flex(xs12 sm10 md8 offset-xs0 offset-sm1 offset-md2)
      //-     v-card(color='grey darken-3')
      //-       v-toolbar(color='blue darken-2' dense)
      //-         v-toolbar-title Panel
      //-         v-spacer
      //-         v-icon(medium) account_box
      //-       v-card-text
      //-         div text
      //-         v-spacer
      //-         v-btn(color='blue darken-2', @click='submit') ON   
      //-       v-card-text
      //-         span text
      //-         v-spacer     
      //-         v-switch(label="John" v-model="ex15" value="John")
</template>


<script>
export default {
  data: () => ({
    valid: true,
    name: "",
    password: "",
    confirmPassword: "",
    nameRules: [
      v => !!v || "Name is required",
      v => (v && v.length <= 10) || "Name must be less than 10 characters"
    ],
    passwordRules: [v => !!v || "Password is required"],
    confirmPasswordRules: [v => !!v || "Confirm password is required"]
    // email: "",
    // emailRules: [
    //   v => !!v || "E-mail is required",
    //   v =>
    //     /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
    //     "E-mail must be valid"
    // ],
  }),
  computed: {
    matchPassword() {
      return this.password === this.confirmPassword;
    }
  },
  methods: {
    submit() {
      if (this.password !== this.confirmPassword) {
        this.confirmPassword = "";
      } else if (this.$refs.form.validate()) {
        // Native form submission is not yet supported
        axios.post("/api/submit", {
          name: this.name
        });
      }
    },
    clear() {
      this.$refs.form.reset();
    }
  }
};
</script>


