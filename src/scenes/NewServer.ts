import { GameEngine } from "@/GameEngine";
import { Button } from "@/objects/Button";
import { Scene, SceneActivationContext, Vector, vec } from "excalibur";
import { MenuScene } from "./MenuScene";

const ui = document.getElementById('ui')

export class NewServer extends MenuScene {
    buttonAreaWidth: number
    buttonAreaHeight: number
    buttonAreaPos: Vector
    padding = 5
    buttonAmountVert = 6
    name: string

    override onInitialize(engine: GameEngine): void {
        super.onInitialize(engine)
        this.name = ""
        this.addSaveButtons(engine)
    }

    onActivate(context: SceneActivationContext<unknown>): void {

        const inputField = document.createElement('input')

        inputField.oninput = (ev) => {
            console.debug(inputField.value)
            this.name = inputField.value
        }

        ui.appendChild(inputField)
    }

    onDeactivate(context: SceneActivationContext): void {
        ui.innerHTML = ''
    }

    addSaveButtons(engine: GameEngine) {

        const maxSaveSlots = 3
        const saveWidth = this.buttonAreaWidth / maxSaveSlots
        const saveHeight = this.buttonAreaHeight / this.buttonAmountVert

        for (let i = 0; i < maxSaveSlots; i++) {

            const button = new Button(
                `Save Slot ${i}`,
                {
                    pos: this.buttonAreaPos.add(vec(
                        saveWidth * (i) + (this.padding / 2),
                        (this.padding / 2))),
                    width: saveWidth - this.padding,
                    height: saveHeight - this.padding
                },
                (_button) => {
                    this.send("createNewServer", this.name)
                    this.engine.goToScene(`Multiplayer`)
                })

            engine.add(button)

        }
    }
}
