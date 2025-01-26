import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import path from 'path';
import { WsMessage } from "./src/utils/serverTypes";
import config from './webpack.server.js';
import { Server as HttpServer } from 'http';
import { Server as WsServer, WebSocket } from 'ws';

class Server {
    app: express.Application
    httpServer: HttpServer
    wsServer: WsServer

    constructor() {
        this.app = express();
        this.wsServer = new WsServer({ noServer: true });
        this.createHttpAPI()
        this.createWsAPI()
        this.addWebpackMiddleware()
    }

    createWsAPI() {

        this.wsServer.on('connection', socket => {
            socket.on('message', message => {
                const wsMessage: WsMessage = JSON.parse(message.toString())
                console.log(`wsMessage: ${wsMessage.type}`)

                switch (wsMessage.type) {
                    case ("createNewServer"):
                        new GameServer(wsMessage.content as string)
                        break
                    case ("connectToServer"):
                        console.debug(`${wsMessage.content}`)
                        GameServer.joinServer(wsMessage.content as string, socket)
                        break
                    case ("debug"):
                        console.debug(`content: ${wsMessage.content}`)
                        break
                    default:
                        console.error(`Could not resolve message type: ${JSON.stringify(wsMessage)}`)
                }
            });


        });
    }

    createHttpAPI() {
        this.app.get("/api/getAvailableServers", (req, res, next) => {
            const data = JSON.stringify(GameServer.availableServers)
            res.send(data)
            next()
        })


        // this.app.get("/api/createNewServer", (req, res, next) => {
        //     // this.addServer(req.hostname)
        //     new GameServer(req.hostname)
        //     res.send()
        //     next()
        // })

        // this.app.post("/api/connectToServer", (req, res, next) => {
        //     const data = req.body
        //     // console.log(req)
        //     // console.log("data:")
        //     // console.log(data)

        //     res.send()
        //     next()
        // })
    }

    addWebpackMiddleware() {
        // Tell express to use the webpack-dev-middleware and use the webpack.server.js
        // configuration file as a base.
        path.resolve(__dirname, "dist")
        const compiler = webpack(config);
        this.app.use(
            webpackDevMiddleware(compiler, {
                publicPath: config.output.publicPath,
            })

        );
    }

    start(port = 8080) {
        // Serve the files on port 8080.
        this.httpServer = this.app.listen(port, function () {
            console.log(`Example app listening on port ${port}!\n`);
        });



        this.httpServer.on('upgrade', (request, socket, head) => {
            this.wsServer.handleUpgrade(request, socket, head, socket => {
                this.wsServer.emit('connection', socket, request);
            });
        });
    }

}

class GameServer {
    static serverList: Map<string, GameServer> = new Map()
    name: string
    webSockets: WebSocket[]

    constructor(name: string) {
        this.name = name
        this.webSockets = []
        GameServer.serverList.set(name, this)
    }

    static get availableServers() {
        const serverNames = []
        GameServer.serverList.forEach((server, name) => {
            serverNames.push({
                name,
                players: server.webSockets.length
            })
        })
        return serverNames
    }

    static joinServer(name: string, webSocket: WebSocket) {
        const server = GameServer.serverList.get(name)
        server.join(webSocket)
    }

    delete() {
        GameServer.serverList.delete(this.name)
    }

    join(webSocket: WebSocket) {
        this.webSockets.push(webSocket)
    }

}

const server = new Server()
server.start()
