
import { GameSaveData, ObjectSaveData, WsMessage } from "./utils/types";
import { GameObject } from "./utils/baseObjects/GameObject";
import { Color, Text, DisplayMode, SolverStrategy, Engine, Font, ScreenElement, vec, ExcaliburGraphicsContext, Scene, GoToOptions } from "excalibur";
import { Player } from "./objects/Player";
import { orbitShader } from "./shaders/OrbitShader";
import { starShader } from "./shaders/StarShader";
import { Planet } from "./objects/Planet";
import { Menu } from "./scenes/Menu";
import { SolarSystem } from "./scenes/SolarSystem";

export class GameEngine extends Engine {
	objects = new Map<string, GameObject>();
	ws?: WebSocket;
	player?: Player;
	elapsedMs: number = 0;
	lastScene: string;

	constructor(ws?: WebSocket) {

		super({
			width: window.innerWidth,
			height: window.innerHeight,
			displayMode: DisplayMode.FitScreen,
			physics: {
				solver: SolverStrategy.Realistic,
				substep: 5 // Sub step the physics simulation for more robust simulations
			},
		});

		this.ws = ws;

		if (!this.ws) return
		this.ws.addEventListener("message", message => {
			const wsMessage = JSON.parse(message.data) as WsMessage;
			this.resolveWsMessage(wsMessage);
		});
	}

	goToScene<TData = undefined>(destinationScene: any, options?: GoToOptions<TData>): Promise<void> {
		this.lastScene = this.currentSceneName
		return super.goToScene(destinationScene, options)
	}

	send(wsMessage: WsMessage) {
		if (!this.ws) return
		if (this.ws.readyState == 1) this.ws.send(JSON.stringify(wsMessage));
	}

	resolveWsMessage(wsMessage: WsMessage) {
		console.log(wsMessage.content);
	}

	onPostStart() {

		this.add("menu", new Menu())
		this.goToScene("menu")
		this.loadSaves()
		// this.addSolarSystem();
		// this.addPlayer();
		// this.addHUD();
		this.addBackground();
		this.addPostProcessor();
		this.save()
	}

	loadSaves() {

		for (let i = 0; i < 3; i++) {
			const solarSystem = new SolarSystem()

			const saveData = JSON.parse(this.getCookie(`save${i}`)) as GameSaveData
			console.debug(saveData)
			solarSystem.saveData = saveData

			this.add(`save${i}`, solarSystem)
		}

	}



	getCookie(name: string) {
		let cookie = ""
		const nameEQ = `${name}=`;
		const ca = document.cookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i].trim();
			if (c.indexOf(nameEQ) == 0) cookie = c.substring(nameEQ.length, c.length);
		}
		console.debug(`Cookie: ${cookie}`)
		return cookie || "[]"
	}

	save() {
		const saveData = { elapsedMs: this.elapsedMs, objects: [] }
		this.objects.forEach((object) => {
			saveData.objects.push(object.saveData())
		})
		console.debug(saveData)

		const saveString = JSON.stringify(saveData, undefined, "\t")
		const cookie = `${this.currentSceneName}=${JSON.stringify(saveData)}; path=/`;
		document.cookie = cookie
	}

	addPostProcessor() {
		this.graphicsContext.addPostProcessor(orbitShader);
		this.graphicsContext.addPostProcessor(starShader);
	}

	// addHUD() {
	// 	const hud = new ScreenElement({
	// 		x: 10,
	// 		y: 30,
	// 		z: 10,
	// 		width: 500,
	// 		height: 500,
	// 	});
	// 	const text = new Text({
	// 		text: "STARTING...",
	// 		font: new Font({ size: 30 }),
	// 		color: Color.White,
	// 	});
	// 	hud.graphics.use(text);
	// 	this.add(hud);

	// 	this.currentScene.on("postupdate", event => {
	// 		const fps = event.engine.stats.currFrame.fps;
	// 		const camMode = this.player?.cam?.getMode();
	// 		const pilotMode = this.player?.autopilot?.getMode();
	// 		text.text = `FPS: ${Math.floor(fps)}\nCAM: ${camMode}\nPILOT: ${pilotMode}`;
	// 	});
	// }

	addBackground() {
		if (!this.ready) return;
		this.backgroundColor = Color.Black;
	}

	// addPlayer() {
	// 	if (!this.ready) return;

	// 	const player = new Player(this);
	// 	player.controls = true;
	// 	player.color = Color.Chartreuse;
	// 	this.player = player;

	// 	const username = player.name;
	// 	this.objects.set(username, player);
	// 	this.add(player);
	// 	// player.lockCamera(this.currentScene.camera);

	// 	this.send({
	// 		type: "join",
	// 		content: { username },
	// 	});
	// }

	// addSolarSystem() {
	// 	const sol = new Planet(this, { radius: 2000 });
	// 	const merc = sol.createSatellite(200, 50000, Math.PI);
	// 	const earth = sol.createSatellite(500, 160000);
	// 	const mun = earth.createSatellite(100, 3000, -Math.PI / 2);

	// 	console.log(earth.pos.toString());

	// 	this.addObject(sol);
	// 	this.addObject(merc);
	// 	this.addObject(earth);
	// 	this.addObject(mun);
	// }

	// addObject(object: GameObject) {
	// 	this.add(object);
	// 	this.objects.set(object.name, object);
	// }

	onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
		super.onPreDraw(ctx, elapsedMs);
		orbitShader
			.setRotation(-this.currentScene.camera.rotation)
			.setZoom(this.currentScene.camera.zoom);
		starShader
			.setRotation(-this.currentScene.camera.rotation)
			.setPos(this.worldToScreenCoordinates(vec(0, 0)))
			.setZoom(this.currentScene.camera.zoom);
	}

	onPostUpdate(engine: Engine, elapsedMs: number): void {
		super.onPostUpdate(engine, elapsedMs)
		// this.elapsedMs += elapsedMs
		// console.debug(this.elapsedMs)
	}
}
