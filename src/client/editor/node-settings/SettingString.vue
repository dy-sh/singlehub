<template lang='pug'>
    v-text-field(:label="setting.description" v-model="setting.value")
</template>

<script>
export default {
  props: ["setting"]
};
</script>
