<template lang='pug'>
    v-text-field(:label="setting.description" v-model="value")
</template>

<script>
export default {
  props: ["setting"],
  data() {
    return {
      value: this.setting.value
    };
  }
};
</script>
