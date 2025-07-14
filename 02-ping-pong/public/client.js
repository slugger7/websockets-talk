const PONG_TIME = 5000
const PING_TIME = PONG_TIME * 9 / 10
const PING = "ping"
const PONG = "pong"

const connectButton = document.getElementById("connect")
const greetServerButton = document.getElementById("greet-server")
const disconnectButton = document.getElementById("disconnect")

let pingInterval
let pongTimeout

connectButton.addEventListener("click", () => {
    const socket = new WebSocket('ws://localhost:8080/ws');

    const greetServerClickHandler = () => {
        const message = "Hello Server, I am Client"
        socket.send(message)
    }

    const disconnectButtonHandler = () => {
        socket.close(1000, "Client is done talking to server")
    }

    socket.addEventListener('open', (event) => {
        console.log("Open data: ", event.data)
        greetServerButton.addEventListener("click", greetServerClickHandler)
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
    });

    socket.addEventListener('close', (event) => {
        console.log('Server connection closed:', event.data);
        greetServerButton.removeEventListener("click", greetServerClickHandler)
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
})
