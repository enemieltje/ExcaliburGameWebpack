
import { GameSaveData, ObjectSaveData } from "./utils/types";
import { GameObject } from "./utils/baseObjects/GameObject";
import { Color, Text, DisplayMode, SolverStrategy, Engine, Font, ScreenElement, vec, ExcaliburGraphicsContext, Scene, GoToOptions, PointerScope } from "excalibur";
import { Player } from "./objects/Player";
import { orbitShader } from "./shaders/OrbitShader";
import { PerlinShader, starShader } from "./shaders/PerlinShader";
import { Planet } from "./objects/Planet";
import { Menu } from "./scenes/Menu";
import { SolarSystem } from "./scenes/SolarSystem";
import { Multiplayer } from "./scenes/Multiplayer";
import { WsMessage } from "./utils/serverTypes";
import { NewServer } from "./scenes/NewServer";
import { dilationShader } from "./shaders/DilationShader";
import { erosionShader } from "./shaders/ErosionShader";
import { ColorShader, colorShader } from "./shaders/ColorShader";
import { flareShader } from "./shaders/FlareShader";
import { TemperatureShader, temperatureShader } from "./shaders/TemperatureShader";
import { blurShader } from "./shaders/BlurShader";
import { streakShader } from "./shaders/StreakShader";

export class GameEngine extends Engine {
	objects = new Map<string, GameObject>();
	ws?: WebSocket;
	player?: Player;
	elapsedMs: number = 0;
	lastScene: string;
	perlinShaders = {
		"99": starShader(0.995),
		"98": starShader(0.98),
		"96": starShader(0.96),
		"95": starShader(0.95),
		"90": starShader(0.90),
	}

	constructor(ws?: WebSocket) {

		super({
			width: window.innerWidth,
			height: window.innerHeight,
			displayMode: DisplayMode.FitScreen,
			// width: 800,
			// height: 600,
			physics: {
				solver: SolverStrategy.Realistic,
				substep: 5 // Sub step the physics simulation for more robust simulations
			},
			canvasElementId: 'game',
			pointerScope: PointerScope.Canvas,
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
		// this.graphicsContext.register(new MyCustomRenderer());

		this.loadScenes()
		this.loadSaves()
		this.goToScene("menu")
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

	loadScenes() {
		this.add("menu", new Menu())
		this.add(`Multiplayer`, new Multiplayer())
		this.add(`New Server`, new NewServer())
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
		this.addStarShaders();
		this.graphicsContext.addPostProcessor(orbitShader);
	}

	addStarShaders() {

		const res = this.screen.resolution
		Object.values(this.perlinShaders).forEach(perlinShader => {
			perlinShader.setResolution(vec(res.width, res.height))
		});
		temperatureShader.setResolution(vec(res.width, res.height))

		this.graphicsContext.addPostProcessor(temperatureShader);
		this.graphicsContext.addPostProcessor(this.perlinShaders[99]);
		this.graphicsContext.addPostProcessor(dilationShader);
		// this.graphicsContext.addPostProcessor(flareShader(20));

		this.graphicsContext.addPostProcessor(this.perlinShaders[98]);
		this.graphicsContext.addPostProcessor(dilationShader);
		// this.graphicsContext.addPostProcessor(flareShader(10));
		this.graphicsContext.addPostProcessor(streakShader);
		this.graphicsContext.addPostProcessor(blurShader(true));
		this.graphicsContext.addPostProcessor(blurShader(false));

		this.graphicsContext.addPostProcessor(this.perlinShaders[96]);
		// this.graphicsContext.addPostProcessor(dilationShader);
		// this.graphicsContext.addPostProcessor(flareShader(2));



		// this.graphicsContext.addPostProcessor(this.perlinShaders[96]);
		// this.graphicsContext.addPostProcessor(dilationShader);

		this.graphicsContext.addPostProcessor(colorShader);
	}

	addBackground() {
		if (!this.ready) return;
		this.backgroundColor = new Color(0, 0, 1)
		// this.backgroundColor = Color.Black;
	}

	onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
		super.onPreDraw(ctx, elapsedMs);
		// temperatureShader
		// 	.setRotation(-this.currentScene.camera.rotation)
		orbitShader
			.setRotation(-this.currentScene.camera.rotation)
			.setZoom(this.currentScene.camera.zoom)
		dilationShader.setZoom(this.currentScene.camera.zoom)
		Object.values(this.perlinShaders).forEach((shader) => this.updatePositionMatrix(shader))
		this.updatePositionMatrix(temperatureShader)
	}

	updatePositionMatrix(shader: PerlinShader | TemperatureShader) {
		const res = this.screen.resolution
		const center = vec(res.width, res.height).scale(0.5)
		shader
			.setRotation(-this.currentScene.camera.rotation)
			.setPos(this.screenToWorldCoordinates(center))
			.setZoom(this.currentScene.camera.zoom);
	}

	onPostUpdate(engine: Engine, elapsedMs: number): void {
		super.onPostUpdate(engine, elapsedMs)
		// this.elapsedMs += elapsedMs
		// console.debug(this.elapsedMs)
	}
}
