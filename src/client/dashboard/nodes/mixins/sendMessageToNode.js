export default {
    methods: {
        sendMessageToNode(message) {
            this.$socket.emit("nodeMessageToServerSide", {
                cid: this.uiElement.cid,
                id: this.uiElement.id,
                message: message
            });
        }
    }
}