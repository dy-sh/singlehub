export default {
    methods: {
        getNodeState(options) {
            this.$socket.emit("dashboardElementGetNodeState", {
                cid: this.uiElement.cid,
                id: this.uiElement.id,
                options: options
            });
        }
    },
    mounted() {
        //subsribe events
        this.$options.sockets.dashboardElementGetNodeState = data => {
            if (this.uiElement.cid === data.cid && this.uiElement.id === data.id) {
                // console.log("state received", data);
                this.state = data.state;
                this.stateReceived = true;
            }
        };

        //get current state of node
        this.getNodeState();
    },
    beforeDestroy() {
        //unsubsribe
        delete this.$options.sockets.dashboardElementGetNodeState;
    }
}