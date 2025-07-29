import { GameEngine } from "@/GameEngine";
import { connectionData } from "@/utils/serverTypes";
import { SceneActivationContext } from "excalibur";
import { MenuScene } from "./MenuScene";

export class Multiplayer extends MenuScene {
    availableServers: connectionData[] = []
    serverButtons: string[] = []

    override onInitialize(engine: GameEngine): void {
        super.onInitialize(engine)
        this.addTopButtons()
        this.refreshServerList()
        this.createWebSocket()

    }

    onActivate(context: SceneActivationContext<unknown>): void {
        this.refreshServerList()
    }

    resolveWsMessage(ev: MessageEvent) {
        console.log(`WebSocket: ${ev.data}`)
    }

    addTopButtons() {
        this.addButton("refresh", 0, (button) => {
            this.refreshServerList()
        })
        this.addButton("New Server", 0, (button) => {
            this.createNewServer()
        })
        this.addButton("back", 0, (button) => {
            this.engine.goToScene("menu")
        })
    }

    refreshServerList() {
        this.getAvailableServers().then(() => {
            this.addServerButtons()
        })
    }

    addServerButtons() {
        this.serverButtons.forEach((buttonName) => {
            const buttonLocation = this.buttonLocations.get(buttonName)
            buttonLocation.button.kill()
        })

        this.buttonData = [this.buttonData[0]]

        this.availableServers.forEach((connectionData, i) => {
            const buttonName = `${connectionData.name} ${connectionData.players}`
            this.addButton(
                buttonName,
                undefined,
                (button) => {
                    console.debug(`Connect to ${connectionData.name}`)
                    this.connectToServer(connectionData)
                }
            )

            this.serverButtons.push(buttonName)
        })
    }

    async getAvailableServers() {
        try {
            const url = new URL('/api/getAvailableServers', window.location.origin)
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            });
            this.availableServers = JSON.parse(await response.text())
        } catch (error) {
            console.error(error)
        }
    }

    createNewServer() {
        this.engine.goToScene("New Server")
    }

    connectToServer(connectionData: connectionData) {
        this.send("connectToServer", connectionData.name)
    }

}
