export default {
    mounted() {
        //subsribe events
        this.$options.sockets.nodeMessageToDashboardSide = data => {
            // console.log(data);
            if (this.uiElement.cid === data.cid && this.uiElement.id === data.id) {
                if (this['onNodeMessage']) {
                    this.onNodeMessage(data.message);
                } else {
                    console.error("Cant receive message from server side. Please, add \"onNodeMessage\" method to dashboard vue-node, that use onNodeMessage mixin")
                }
            };
        }
    },
    beforeDestroy() {
        //unsubsribe
        delete this.$options.sockets.nodeMessageToDashboardSide;
    }
}