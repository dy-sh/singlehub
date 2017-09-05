<template lang='jade'>

</template>


<script>
export default {
  data: () => ({
    drawer: true,
    title: "SingleHub",
    items: [
      { icon: "trending_up", text: "Most Popular" },
      { icon: "subscriptions", text: "Subscriptions" }
      // { icon: "history", text: "History" },
      // { icon: "featured_play_list", text: "Playlists" },
      // { icon: "watch_later", text: "Watch Later" }
    ],
    items2: [{ picture: 28, text: "Joseph" }, { picture: 38, text: "Apple" }]
  })
};
</script>


<style>

</style>