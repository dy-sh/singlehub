<template lang='pug'>
    v-select(:label="setting.description", v-model="setting.value", :items="setting.config.items")
</template>

<script>
export default {
  props: ["setting"]
};
</script>
