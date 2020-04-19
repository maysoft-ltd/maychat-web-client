(function (global) {
    const baseUrl = "http://localhost:3030/";
    const options = { transports: ['websocket'], pingTimeout: 3000, pingInterval: 5000 };
    const socket = io("http://chat.maysoft.io:3333/", options);
    const client = feathers();
    client.configure(feathers.socketio(socket));
    client.configure(feathers.authentication());
    const chatHTML = 
    `<audio id="msgRingTone">
        <source src="${baseUrl}message_tone.mp3" type="audio/mpeg">
    </audio>
    <img id="maychatOpenButton" src="${baseUrl}chat-logo.png" class="maychat-btn-chat" style="display: block;"></img>
    <img id="maychatCloseButton" src="${baseUrl}close-popup.png" class="maychat-btn-chat" style="display: none;">
    <div class="maychat-chat-popup" id="myForm">
        <div class="maychat-form-container">
            <div class="maychat-chat-header">
                <img src="${baseUrl}chat-logo.png" class="maychat-avatar">
                <span>Maychat</span>
            </div>
            <main class="maychat-chat"></main>
            <div class="maychat-copyright">
                <a href="http://maysoft.io/" target="_blank">Powered by <b>maysoft.io</b></a>
            </div>
            <form id="maychatSendMessage">
                <input type="text" placeholder="Nhập tin nhắn..." name="text"></input>
                <div class="maychat-btn-send">
                    <img id="maychatSend" src="${baseUrl}send-icon.png" class="maychat-img-send" alt="Gửi" title="Gửi">
                </div>
            </form>
        </div>
    </div>`;

    // Renders a message to the page
    const addMessage = message => {
        var msgRingTone = document.getElementById("msgRingTone");
        // The user that sent this message (added by the populate-user hook)
        const { user = {} } = message;
        const chat = document.querySelector('.maychat-chat');
        // Escape HTML to prevent XSS attacks
        const text = message.message
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;');

        if (chat) {
            if (message.senderId !== visitor._id) {
                chat.innerHTML += `
            <div class="maychat-message-container">
                <img src="${baseUrl}chat-logo.png" class="maychat-avatar">
                <span class="maychat-message-content receive">${text}</span>
            </div>`;
                msgRingTone.play();
            } else {
                chat.innerHTML += `
            <div class="maychat-message-container" style="justify-content: flex-end;">
                <span class="maychat-message-content send">${text}</span>
            </div>`;
            }
            // Always scroll to the bottom of our message list
            chat.scrollTop = chat.scrollHeight - chat.clientHeight;
        }
    };

    // Shows the chat page
    const showChat = async () => {
        var chatBubble = document.createElement("div");
        chatBubble.innerHTML = chatHTML;
        document.body.appendChild(chatBubble);
    };
    let visitor;

    // Log in either using the given email/password or the token from storage
    const login = async () => {
        try {
            showChat();
            const oldVisitorId = sessionStorage.getItem("maychat_visitor_id");
            const visitorId = `${global.username}@${global.projectId}`;
            if (oldVisitorId) {
                visitor = await client.authenticate({
                    strategy: 'api-key',
                    apiKey: global.apiKey,
                    visitorName: global.username,
                    visitorId,
                    _id: oldVisitorId
                });
                if (visitor.messages && visitor.messages.length > 0) {
                    visitor.messages.forEach(addMessage);
                }
            } else {
                visitor = await client.authenticate({
                    strategy: "api-key",
                    apiKey: global.apiKey,
                    visitorName: global.username,
                    visitorId,
                });
                sessionStorage.setItem("maychat_visitor_id", visitor._id);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addEventListener = (selector, event, handler) => {
        document.addEventListener(event, async ev => {
            if (ev.target.closest(selector)) {
                handler(ev);
            }
        });
    };

    // // "Send" message form submission handler
    addEventListener('#maychatSendMessage', 'submit', async ev => {
        // This is the message text input field
        const input = document.querySelector('[name="text"]');
        if (input.value === "") {
            return;
        }
        ev.preventDefault();

        // Create a new message and then clear the input field
        await client.service('messages').create({
            channelId: visitor.channelId,
            threadId: visitor.threadId,
            senderId: visitor.visitorId,
            projectId: visitor.projectId,
            messageType: 1,
            message: input.value,
        });

        input.value = '';
    });

    // // "Send" message form click handler
    addEventListener('#maychatSend', 'click', async ev => {
        // This is the message text input field
        const input = document.querySelector('[name="text"]');
        if (input.value === "") {
            return;
        }
        ev.preventDefault();

        // Create a new message and then clear the input field
        await client.service('messages').create({
            channelId: visitor.channelId,
            threadId: visitor.threadId,
            senderId: visitor._id,
            projectId: visitor.projectId,
            messageType: 1,
            message: input.value,
        });

        input.value = '';
    });
    addEventListener('#maychatOpenButton', 'click', async ev => {
        document.getElementById("myForm").style.display = "block";
        document.getElementById("maychatOpenButton").style.display = "none";
        document.getElementById("maychatCloseButton").style.display = "block";
    });
    addEventListener('#maychatCloseButton', 'click', async ev => {
        document.getElementById("myForm").style.display = "none";
        document.getElementById("maychatOpenButton").style.display = "block";
        document.getElementById("maychatCloseButton").style.display = "none";

    });
    client.service('messages').on('created', addMessage);
    login();
})(window);
