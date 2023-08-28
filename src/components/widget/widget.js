import React, { Component } from 'react';

class Widget extends Component {
    componentDidMount() {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@widgetbot/crate@3";
        script.async = true;
        script.defer = true;
        script.innerHTML = `new Crate({
                server: '1009699169319010417', // Monster's NFT Inc. server
                channel: '1009699170065600566' // #💬-general-chat
            });`;
        document.body.appendChild(script);
    }

    render() {
        return <div />;
    }
}

export default Widget;
