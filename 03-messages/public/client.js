const PONG_TIME = 10000
const PING_TIME = PONG_TIME * 9 / 10
const PING = "ping"
const PONG = "pong"

const connectButton = document.getElementById("connect")
const disconnectButton = document.getElementById("disconnect")
const sendMessageButton = document.getElementById("send-message")
const messages = document.getElementById("messages")

let pingInterval
let pongTimeout

connectButton.addEventListener("click", () => {
    const name = document.getElementById("name").value;
    console.log("Name", name)
    const socket = new WebSocket('ws://localhost:8080/ws');

    const disconnectButtonHandler = () => {
        socket.close(1000, "Client is done talking to server")
    }

    socket.addEventListener('open', (event) => {
        console.log("Open data: ", event.data)
        disconnectButton.addEventListener("click", disconnectButtonHandler)

        ping()
        pong()
    });

    socket.addEventListener('message', (event) => {
        if (event.data === PONG) {
            console.debug(PONG)
            pong()
            return
        }

        const msg = JSON.parse(event.data)
        console.log("msg", msg)

        const message = document.createElement("p")
        message.innerHTML = `<span>${msg.author}</span>: ${msg.content}`
        messages.appendChild(message)
    });

    socket.addEventListener('close', (event) => {
        console.log('Server connection closed:', event.data);
        disconnectButton.removeEventListener("click", disconnectButtonHandler)

        clearInterval(pingInterval)
        clearTimeout(pongTimeout)
    });

    const ping = () => {
        pingInterval = setInterval(() => {
            console.debug(PING)
            if (socket && socket.readyState !== WebSocket.CLOSED) {
                try {
                    socket.send(PING)
                } catch (e) {
                    console.error("error sending ping on websocket", e)
                }
            }
        }, PING_TIME)
    }

    const pong = () => {
        clearTimeout(pongTimeout)
        pongTimeout = setTimeout(() => {
            console.warn("Timout reached")
            clearInterval(pingInterval)
            clearTimeout(pongTimeout)
            socket.close()
        }, PONG_TIME)
    }

    sendMessageButton.addEventListener("click", () => {
        const msgInput = document.getElementById("message")
        const nameInput = document.getElementById("name")
        

        socket.send(JSON.stringify({
            type: "message",
            content: msgInput.value,
            author: nameInput.value
        }))

        msgInput.value = ""
    })
})
