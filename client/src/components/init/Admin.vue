<template lang='pug'>
main
  v-content    
    v-container(grid-list-xl)
      v-layout(row wrap)
        v-flex(xs12 sm10 md8 offset-xs0 offset-sm1 offset-md2)
          //- v-card(dark color='green')
          v-card(color='grey darken-3')
            v-toolbar(color='blue darken-2' dense)
              v-toolbar-title Admin profile
              v-spacer
              v-icon(medium) account_box
            v-card-text
              v-form(v-model='valid', ref='form', lazy-validation)
                v-text-field(label='Name', v-model='name', :rules='nameRules', :counter='10', required)
                v-text-field(type="password", label='Password', v-model='password', :rules='passwordRules',  required)
                v-text-field(type="password", label='Confirm password', v-model='confirmPassword', :rules='confirmPasswordRules', required)
                //- v-text-field(label='E-mail', v-model='email', :rules='emailRules', required)
                .text-xs-center 
                  v-btn(color='grey darken-2', @click="clear") Clear
                  v-btn(color='blue darken-2', @click='submit', :disabled='!valid') Register   
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


