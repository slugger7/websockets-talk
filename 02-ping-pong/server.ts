import path from "node:path"

const PING = "ping"
const PONG = "pong"

const server = Bun.serve({
    port: 8080,
    routes: {
        "/ws": (req, server) => {
            if (server.upgrade(req)) {
                return;
            }

            return new Response("Upgrade failed", { status: 500})
        }
    },
    fetch(req) {
        let p = new URL(req.url).pathname
        if (p === "/") {
            p = "/index.html"
        }
        const fullPath = path.join(__dirname, "public", p)
        const file = Bun.file(fullPath)
        
        return new Response(file)
    },
    websocket: {
        async message(ws, message) {
            if (message === PING) {
                ws.send(PONG)
                return
            }
            console.log("Message was received from client: ", message)
            ws.send("I got your message!")
        },
        open(ws) {
            console.log("Connection opened")

            ws.send("Hello client, I am server")
        },
        close(ws, code, message) {
            console.log("Connection closed: ", code, message)
        },
        drain(ws) { },
        sendPings: true
    }
})

console.log(`Listening on ${server.hostname}:${server.port}`)