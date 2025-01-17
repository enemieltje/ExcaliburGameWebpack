import { Button } from "@/objects/Button";
import { Color, DefaultLoader, Engine, ExcaliburGraphicsContext, KeyEvent, Keys, Scene, SceneActivationContext, vec, Vector } from "excalibur";
import { SolarSystem } from "./SolarSystem";
import { orbitShader } from "@/shaders/OrbitShader";
import { GameEngine } from "@/GameEngine";
import { GameObject } from "@/utils/baseObjects/GameObject";


export class Menu extends Scene {
    engine: GameEngine
    buttonAreaWidth: number
    buttonAreaHeight: number
    buttonAreaPos: Vector
    padding = 5
    buttonAmountVert = 5

    override onInitialize(engine: GameEngine): void {
        console.debug("init menu")
        this.engine = engine
        this.buttonAreaWidth = engine.drawWidth * (2 / 3)
        this.buttonAreaHeight = engine.drawHeight * (2 / 3)
        this.buttonAreaPos = vec(
            engine.drawWidth * (1 / 6),
            engine.drawHeight * (1 / 6),
        )

        // Scene.onInitialize is where we recommend you perform the composition for your game
        this.addSaveButtons(engine)
        this.addGeneralButton(engine, "Ship Editor", 1)
        this.addGeneralButton(engine, "Part Editor", 2)
        this.addGeneralButton(engine, "Universe Editor", 3)
        this.addGeneralButton(engine, "Settings", 4)

    }

    addGeneralButton(engine: GameEngine, text: string, i: number) {
        const button = new Button(
            text,
            {
                pos: vec(
                    this.buttonAreaPos.x + (this.padding / 2),
                    this.buttonAreaPos.y + (this.buttonAreaHeight / this.buttonAmountVert * (i)) + (this.padding / 2)),
                width: this.buttonAreaWidth - this.padding,
                height: this.buttonAreaHeight / this.buttonAmountVert - this.padding
            },
            (button) => {
                console.debug(`Button ${button.text}`)
            })

        engine.add(button)
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
                    console.debug(`Load save ${i}`)
                    this.engine.goToScene(`save${i}`)
                })

            engine.add(button)

        }
    }

    override onPreLoad(loader: DefaultLoader): void {
        // Add any scene specific resources to load
    }

    override onActivate(context: SceneActivationContext<unknown>): void {
        // Called when Excalibur transitions to this scene
        // Only 1 scene is active at a time
        this.engine.objects = new Map<string, GameObject>();
        orbitShader.clearOrbits()
        // this.engine.input.keyboard.on("press", (evt: KeyEvent) => {
        //     // if (evt.key == Keys.Escape)
        //     console.debug(this.engine.lastScene)
        //     this.engine.goToScene(this.engine.lastScene)
        // });
    }

    override onDeactivate(context: SceneActivationContext): void {
        // Called when Excalibur transitions away from this scene
        // Only 1 scene is active at a time
    }

    override onPreUpdate(engine: Engine, elapsedMs: number): void {
        // Called before anything updates in the scene
    }

    override onPostUpdate(engine: Engine, elapsedMs: number): void {
        // Called after everything updates in the scene
    }

    update(engine: Engine, elapsedMs: number): void {
        super.update(engine, elapsedMs)
        if (engine.input.keyboard.wasPressed(Keys.Escape)) {
            this.engine.goToScene(this.engine.lastScene)
        }
    }

    override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
        // Called before Excalibur draws to the screen
    }

    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
        // Called after Excalibur draws to the screen
    }
}
