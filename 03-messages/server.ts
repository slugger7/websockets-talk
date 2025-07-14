import path from "node:path"

const PING = "ping"
const PONG = "pong"

type WsBody = {
    sessionId: string
}
type WsMessageTypes = "message"
type WsMessage = {
    type: WsMessageTypes
    content: string,
    author: string
}

const clients: {[key:string]: Bun.ServerWebSocket<WsBody> | undefined} = {}

const server = Bun.serve({
    port: 8080,
    routes: {
        "/ws": async (req, server) => {
            const sessionId = await crypto.randomUUID();

            clients[sessionId.toString()] = undefined
            if (server.upgrade(req, { data: {
                sessionId
            } })) {
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
        async message(ws: Bun.ServerWebSocket<WsBody>, message) {
            if (message === PING) {
                ws.send(PONG)
                return
            }
            
            const msg: WsMessage = JSON.parse(message.toString())
            
            Object.values(clients).forEach(w => {
                if (w) {
                    w.send(JSON.stringify(msg))
                }
            })
            
        },
        open(ws: Bun.ServerWebSocket<WsBody>) {
            console.log("Connection opened", ws.data)

            clients[ws.data.sessionId] = ws
        },
        close(ws: Bun.ServerWebSocket<WsBody>, code, message) {
            console.log("Connection closed: ", code, message)

            clients[ws.data.sessionId] = undefined
        },
        drain(ws) { },
        sendPings: true
    }
})

console.log(`Listening on ${server.hostname}:${server.port}`)