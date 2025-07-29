import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import path from 'path';
import { InterfaceMetaData, PartMetaData, PartsMetaData, WsMessage } from "./src/utils/serverTypes";
import config from './webpack.server.js';
import { Server as HttpServer } from 'http';
import { Server as WsServer, WebSocket } from 'ws';
import * as fs from 'fs'
// import { createEmptyPartMetaData, PartMetaData } from './src/utils/types';

class Server {
    app: express.Application
    httpServer: HttpServer
    wsServer: WsServer
    parts: Record<string, PartMetaData> = {}
    interfaces: Record<string, InterfaceMetaData> = {}

    constructor() {
        this.app = express();
        this.wsServer = new WsServer({ noServer: true });
        this.createHttpAPI()
        this.createWsAPI()
        this.addWebpackMiddleware()
        this.reloadResources()
    }

    reloadResources() {
        const resourcePath = path.resolve(__dirname, "resources")
        const resourceFolders = fs.readdirSync(resourcePath)

        if (resourceFolders.length == 0) {
            const basePath = path.resolve(resourcePath, "base")
            fs.mkdirSync(basePath)
            this.reloadResources()
        }

        resourceFolders.forEach((folder) => {
            const currentResourcePath = path.resolve(resourcePath, folder)
            this.loadResource(currentResourcePath)
        })
    }

    loadResource(resourcePath: string) {
        console.debug(`loading resource ${resourcePath}`)
        const partsPath = path.resolve(resourcePath, "parts.json")

        if (!fs.existsSync(partsPath)) {
            fs.writeFileSync(partsPath, "")
        }
        const partsMetaData = JSON.parse(fs.readFileSync(partsPath, { encoding: "utf-8" })) as PartsMetaData

        this.parts = { ...this.parts, ...partsMetaData?.parts }
        this.interfaces = { ...this.interfaces, ...partsMetaData?.interfaces }
    }

    createWsAPI() {

        this.wsServer.on('connection', socket => {
            console.log(`New Websocket Connection!`)
            const res = { type: "debug", content: "Hello from Server" }
            socket.send(JSON.stringify(res))
            socket.on('message', message => {
                const wsMessage: WsMessage = JSON.parse(message.toString())
                console.log(`wsMessage: ${wsMessage.type}`)
                let res: WsMessage;
                switch (wsMessage.type) {
                    case ("createNewServer"):
                        new GameServer(wsMessage.content as string)
                        break
                    case ("connectToServer"):
                        console.debug(`${wsMessage.content}`)
                        GameServer.joinServer(wsMessage.content as string, socket)
                        break
                    case ("getParts"):
                        console.debug(`getParts: ${JSON.stringify(this.parts, undefined, 2)}`)
                        res = { type: "parts", content: this.parts }
                        socket.send(JSON.stringify(res))
                        break;
                    case ("getInterfaces"):
                        console.debug(`getInterfaces: ${JSON.stringify(this.interfaces, undefined, 2)}`)
                        res = { type: "interfaces", content: this.interfaces }
                        socket.send(JSON.stringify(res))
                        break;
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
