import * as ex from "excalibur";
import { ObjectType } from "../ObjectType";
import { GameEngine } from "../../GameEngine";
import { Actor, ActorArgs, Keys, Engine } from "excalibur";

export class GameObject extends ex.Actor {
	type: ObjectType;
	engine: GameEngine;
	keyList: Keys[] = [];
	lastKeyList: Keys[] = [];
	namePlate?: Actor;

	constructor(engine: GameEngine, config?: ActorArgs) {
		super(config);
		// this.logger.info("new gameobject:", this.name);
		this.type = ObjectType.GameObject;
		this.engine = engine;
		this.start()
	}

	start() {}

	resolveKeys(_control: Keys, _type = "hold") {}

	onPostUpdate(engine: Engine, delta: number): void {
		super.onPostUpdate(engine, delta);
		this.lastKeyList = this.keyList;
		this.lastKeyList = [];
		this.keyList.forEach(key => {
			this.lastKeyList.push(key);
		});
	}
}
