import { Button } from "@/objects/Button";
import { Color, DefaultLoader, Engine, ExcaliburGraphicsContext, KeyEvent, Keys, Scene, SceneActivationContext, vec, Vector } from "excalibur";
import { SolarSystem } from "./SolarSystem";
import { orbitShader } from "@/shaders/OrbitShader";
import { GameEngine } from "@/GameEngine";
import { GameObject } from "@/utils/baseObjects/GameObject";
import { MenuScene } from "./MenuScene";


export class Menu extends MenuScene {

    override onInitialize(engine: GameEngine): void {
        super.onInitialize(engine)

        this.addSaveButtons(engine)
        this.addButton("Multiplayer")
        this.addButton("Ship Editor")
        this.addButton("Part Editor")
        this.addButton("Universe Editor")
        this.addButton("Settings")

    }

    addSaveButtons(engine: GameEngine) {
        const maxSaveSlots = 3

        for (let i = 0; i < maxSaveSlots; i++) {

            this.addButton(`Save Slot ${i}`, 0, (button) => {
                console.debug(`Load save ${i}`)
                this.engine.goToScene(`save${i}`)
            })
        }
    }

    override onActivate(context: SceneActivationContext<unknown>): void {
        this.engine.objects = new Map<string, GameObject>();
        orbitShader.clearOrbits()
    }


}
