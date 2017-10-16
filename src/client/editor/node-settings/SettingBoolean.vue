<template lang='pug'>
    v-checkbox(:label="setting.description" v-model="setting.value")
</template>

<script>
export default {
  props: ["setting"]
};
</script>
