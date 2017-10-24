export default {
    methods: {
        setNodeState(state) {
            this.$socket.emit("dashboardElementSetNodeState", {
                cid: this.uiElement.cid,
                id: this.uiElement.id,
                state: state
            });
        }
    }
}