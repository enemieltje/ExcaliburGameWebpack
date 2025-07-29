import { GameEngine } from "@/GameEngine"
import { orbitShader } from "@/shaders/OrbitShader"
import { GameObject } from "@/utils/baseObjects/GameObject"
import { SceneActivationContext, vec } from "excalibur"
import { MenuScene } from "./MenuScene"

export class PartEditor extends MenuScene {
    loadedInterfaces = ["test 1", "test 2", "test 3", "test 4"]

    override onInitialize(engine: GameEngine): void {
        super.onInitialize(engine)
        this.buttonAreaWidth = engine.drawWidth * (5 / 6)
        this.buttonAreaHeight = engine.drawHeight * (5 / 6)
        this.buttonAreaPos = vec(
            engine.drawWidth * (1 / 12),
            engine.drawHeight * (1 / 12),
        )

        this.addButton("Current Part", 0, () => { this.currentPart() })
        this.addButton("Save Part", 0, () => { this.savePart() })
        this.addButton("Load Part", 0, () => { this.loadPart() })
        this.addButton("Upload Image", 0, () => { this.uploadImage() })
        this.addInterfaceButtons()
        this.addButton("Add Part Interface", 5, () => { this.addInterface() })
        this.addEmptyButton(5, 2)
        this.addButton("Back", 5, () => { this.engine.goToScene(this.engine.lastScene) })

    }

    addInterfaceButtons() {
        for (let i = 0; i < 4; i++) {
            const partInterface = this.loadedInterfaces[i]
            this.addButton(partInterface, i + 1, () => { this.createInterface(partInterface) });
            this.addEmptyButton(i + 1, 3)
        }
    }

    createInterface(partInterface: string) {
        console.log(`create Interface: ${partInterface}`)
    }

    currentPart() {
        console.log("Current Part")
    }

    savePart() {
        console.log("Save Part")
    }

    loadPart() {
        console.log("Load Part")
    }

    uploadImage() {
        console.log("Upload Image")
    }

    addInterface() {
        console.log("Add Interface")
    }


    override onActivate(context: SceneActivationContext<unknown>): void {
        this.engine.objects = new Map<string, GameObject>();
        orbitShader.clearOrbits()
    }


}
