import { GameEngine } from "@/GameEngine";
import { Planet } from "@/objects/Planet";
import { Player } from "@/objects/Player";
import { orbitShader } from "@/shaders/OrbitShader";
import { starShader } from "@/shaders/StarShader";
import { GameObject } from "@/utils/baseObjects/GameObject";
import { Color, Engine, Font, Scene, Text, ScreenElement, SceneActivationContext } from "excalibur";

export class SolarSystem extends Scene {
    engine: GameEngine
    elapsedMs: number = 0
    player: Player
    objects = new Map<string, GameObject>();

    override onInitialize(engine: GameEngine): void {
        this.engine = engine
        // this.addBackground();
        this.addSolarSystem();
        this.addPlayer();
        this.addHUD();
        // this.addPostProcessor();
    }

    addPostProcessor() {
        this.engine.graphicsContext.addPostProcessor(orbitShader);
        this.engine.graphicsContext.addPostProcessor(starShader);
    }

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
            text.text = `FPS: ${Math.floor(fps)}\nCAM: ${camMode}\nPILOT: ${pilotMode}`;
        });
    }

    addPlayer() {
        const player = new Player(this.engine);
        player.controls = true;
        player.color = Color.Chartreuse;
        this.player = player;

        this.add(player);
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
        this.add(object);
        this.objects.set(object.name, object);
    }

    addBackground() {
        this.backgroundColor = Color.Black;
    }

    override onActivate(context: SceneActivationContext<unknown>): void {
        this.engine.objects = new Map<string, GameObject>();
        this.engine.objects = this.objects
        orbitShader.clearOrbits()
    }


    override onPostUpdate(engine: Engine, elapsedMs: number): void {
        this.elapsedMs += elapsedMs
        this.engine.elapsedMs = this.elapsedMs
    }

}
