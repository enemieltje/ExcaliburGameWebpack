import { GameEngine } from "@/GameEngine";
import { Background } from "@/objects/Background";
import { Planet } from "@/objects/Planet";
import { Player } from "@/objects/Player";
import { orbitShader } from "@/shaders/OrbitShader";
import { starShader } from "@/shaders/PerlinShader";
import { GameObject } from "@/utils/baseObjects/GameObject";
import { ObjectType, ObjectSaveData, GameSaveData } from "@/utils/types";
import { Color, Engine, Font, Scene, Text, ScreenElement, SceneActivationContext, vec, Vector } from "excalibur";
import { copyFileSync } from "fs";

export class SolarSystem extends Scene {
    engine: GameEngine
    elapsedMs: number = 0
    player: Player
    objects: Map<string, GameObject>;
    saveData: GameSaveData;

    override onInitialize(engine: GameEngine): void {
        this.engine = engine
        // this.addBackground();
        this.addHUD();
        this.objects = new Map()
        // this.addPostProcessor();
        // this.startNewSave()
        if (this.saveData.objects) this.loadSaveData()
        else this.startNewSave()
    }

    startNewSave() {
        console.debug("Starting new Save")
        this.addDebugSolarSystem()
        // this.addSolarSystem();
        this.addPlayer();
        this.player.pos = vec(400, 300)
        // this.player.color = new Color(0, 255, 255, 0)
        // this.player.graphics.hide()
    }

    loadSaveData() {
        console.debug("Loading save")
        // this.objects.clear()
        // this.objects = new Map<string, GameObject>();
        // console.debug(this.saveData)
        // console.debug(this.objects)
        this.elapsedMs = this.saveData.elapsedMs
        this.saveData.objects.forEach((objectSaveData) => (this.loadObject(objectSaveData)))
        this.engine.objects = this.objects
        this.objects.forEach((object) => { object.onPostLoad() })
    }

    loadObject(objectSaveData: ObjectSaveData) {
        let object: GameObject
        switch (objectSaveData.type) {
            case (ObjectType.Planet):
                object = Planet.fromSaveData(this.engine, objectSaveData)
                break
            case (ObjectType.Player):
                object = Player.fromSaveData(this.engine, objectSaveData)
                this.player = object as Player;
                break
        }
        this.addObject(object)
    }

    // addPostProcessor() {
    //     this.engine.graphicsContext.addPostProcessor(orbitShader);
    //     this.engine.graphicsContext.addPostProcessor(starShader);
    // }

    addHUD() {
        const hud = new ScreenElement({
            x: 10,
            y: 30,
            z: 10,
            width: 500,
            height: 500,
        });
        const text = new Text({
            text: "STARTING...",
            font: new Font({ size: 30 }),
            color: Color.White,
        });
        hud.graphics.use(text);
        this.add(hud);

        this.on("postupdate", event => {
            const fps = event.engine.stats.currFrame.fps;
            const camMode = this.player?.cam?.getMode();
            const pilotMode = this.player?.autopilot?.getMode();
            const pos = this.player?.pos
            const zoom = this.player?.engine.currentScene.camera.zoom
            text.text = `FPS: ${Math.floor(fps)}\nCAM: ${camMode}\nPILOT: ${pilotMode}\nPOS: ${pos?.x.toFixed(0)}, ${pos?.y.toFixed(0)}\nZOOM: ${zoom}`;
        });
    }

    addPlayer() {
        const player = new Player(this.engine);
        player.controls = true;
        player.color = Color.Chartreuse;
        this.player = player;

        this.addObject(player);
    }

    addDebugSolarSystem() {
        const sol = new Planet(this.engine, { radius: 100 });
        // sol.body.mass = 0.01
        this.addObject(sol);

    }

    addSolarSystem() {
        const sol = new Planet(this.engine, { radius: 2000 });
        const merc = sol.createSatellite(200, 50000, Math.PI);
        const earth = sol.createSatellite(500, 160000);
        const mun = earth.createSatellite(100, 3000, -Math.PI / 2);

        this.addObject(sol);
        this.addObject(merc);
        this.addObject(earth);
        this.addObject(mun);
    }

    addObject(object: GameObject) {
        console.debug(`addObject: ${object.name}`)
        this.add(object);
        this.objects.set(object.name, object);
    }

    addBackground() {
        const background = new Background(this.engine)
        this.add(background)
    }

    override onActivate(context: SceneActivationContext<unknown>): void {

        // if (this.saveData.objects) this.loadSaveData()
        // else this.startNewSave()

        this.engine.objects = new Map<string, GameObject>();
        this.engine.objects = this.objects
        orbitShader.clearOrbits()
    }


    override onPostUpdate(engine: Engine, elapsedMs: number): void {
        this.elapsedMs += elapsedMs
        this.engine.elapsedMs = this.elapsedMs
    }

}
