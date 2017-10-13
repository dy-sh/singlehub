<template lang='pug'>
    v-text-field(:label="description" v-model="newValue")
</template>

<script>
export default {
  props: ["value", "description"],
  data() {
    return {
      newValue: this.value
    };
  }
};
</script>
