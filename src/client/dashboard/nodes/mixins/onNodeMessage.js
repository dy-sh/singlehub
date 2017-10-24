export default {
    mounted() {
        //subsribe events
        this.$options.sockets.nodeMessageToDashboardSide = data => {
            console.log(data);
            if (this.uiElement.cid === data.cid && this.uiElement.id === data.id) {
                if (node['onNodeMessage']) {
                    node['onNodeMessage'](data.message);
                }
            };
        }
    },
    beforeDestroy() {
        //unsubsribe
        delete this.$options.sockets.nodeMessageToDashboardSide;
    }
}