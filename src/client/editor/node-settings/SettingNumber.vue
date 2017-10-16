<template lang='pug'>
    v-text-field(:label="setting.description" v-model="setting.value" type="number")
</template>

<script>
export default {
  props: ["setting"]
};
</script>
