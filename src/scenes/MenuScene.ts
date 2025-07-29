import { GameEngine } from "@/GameEngine";
import { Background } from "@/objects/Background";
import { Button } from "@/objects/Button";
import { WsMessageType } from "@/utils/serverTypes";
import { Engine, Keys, Scene, vec, Vector } from "excalibur";

export class MenuScene extends Scene {

    engine: GameEngine
    buttonAreaWidth: number
    buttonAreaHeight: number
    buttonAreaPos: Vector
    padding = 5

    socket: WebSocket
    buttonData: ({
        text: string,
        callback: (button: Button) => void,
    } | null)[][]
    buttonLocations: Map<string, { button: Button, row: number, column: number }> = new Map()

    override onInitialize(engine: GameEngine): void {
        this.engine = engine
        this.buttonAreaWidth = engine.drawWidth * (2 / 3)
        this.buttonAreaHeight = engine.drawHeight * (2 / 3)
        this.buttonAreaPos = vec(
            engine.drawWidth * (1 / 6),
            engine.drawHeight * (1 / 6),
        )
        // this.createWebSocket()
        // this.addBackground()
    }

    addBackground() {
        const background = new Background(this.engine)
        this.engine.add(background)
    }

    reloadButtons() {
        // console.debug(`Reload Buttons`)
        this.buttonLocations.forEach(data => {
            data.button.kill()
        })

        this.buttonLocations = new Map()
        this.buttonData.forEach((buttonRow, row) => {
            buttonRow.forEach((data, column) => {
                if (!data) return
                const button = new Button(
                    data.text,
                    {
                        pos: vec(
                            this.buttonAreaPos.x +
                            (this.buttonAreaWidth / buttonRow.length * (column)) +
                            (this.padding / 2),

                            this.buttonAreaPos.y +
                            (this.buttonAreaHeight / this.buttonData.length * (row)) +
                            (this.padding / 2)),

                        width: this.buttonAreaWidth / buttonRow.length - this.padding,
                        height: this.buttonAreaHeight / this.buttonData.length - this.padding
                    }, data.callback
                )
                this.buttonLocations.set(data.text, { button, row, column })
                // console.debug(`Adding ${data.text} to button locations`)
                this.engine.add(button)
            })
        })
    }

    addButton(text: string, row?: number, callback?: (button: Button) => void) {
        if (row === undefined) row = this.buttonData.length
        if (!this.buttonData) this.buttonData = []
        if (!this.buttonData[row]) this.buttonData[row] = []
        const column = this.buttonData[row].length

        if (!callback) callback = (button: Button) => {
            console.debug(`Button ${button.text}`)
            this.engine.goToScene(button.text)
        }

        this.buttonData[row][column] = { text, callback }
        this.reloadButtons()
    }

    addEmptyButton(row: number, column: number) {
        if (row === undefined) row = this.buttonData.length
        if (!this.buttonData) this.buttonData = []
        if (!this.buttonData[row]) this.buttonData[row] = []

        this.buttonData[row][column] = null
    }

    send(type: WsMessageType, content: any) {
        const wsMessage = {
            type: type,
            content: content
        }
        this.socket.send(JSON.stringify(wsMessage))
    }

    createWebSocket() {
        this.socket = new WebSocket(window.location.origin)
        this.socket.onopen = (ev) => this.onStart(ev)

        this.socket.onmessage = (ev) => this.resolveWsMessage(ev)
    }

    resolveWsMessage(ev: MessageEvent) {
        console.log(`WebSocket: ${ev.data}`)
    }

    onStart(ev: Event) {
        this.send("debug", "start!")
    }

    update(engine: Engine, elapsedMs: number): void {
        super.update(engine, elapsedMs)
        if (engine.input.keyboard.wasPressed(Keys.Escape)) {
            this.engine.goToScene(this.engine.lastScene)
        }
    }
}
