const connectButton = document.getElementById("connect")
const greetServerButton = document.getElementById("greet-server")
const disconnectButton = document.getElementById("disconnect")

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
    });

    socket.addEventListener('message', (event) => {
        console.log("Message from server: ", event.data)
    });

    socket.addEventListener('close', (event) => {
        console.log('Server connection closed:', event.data);
        greetServerButton.removeEventListener("click", greetServerClickHandler)
        disconnectButton.removeEventListener("click", disconnectButtonHandler)
    });
})
