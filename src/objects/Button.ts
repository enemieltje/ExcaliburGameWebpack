import { Actor, ActorArgs, CollisionType, Color, Graphic, Line, Raster, vec, Vector, Text, Font, TextAlign, Label } from "excalibur";
import { GameObject } from "../utils/baseObjects/GameObject";
import { GameEngine } from "@/GameEngine";

export class Button extends Actor {
    namePlate: Actor
    text: string

    constructor(text: string, config: ActorArgs, onClick: (button: Button) => void) {
        super({
            name: "menu_" + text,
            pos: config.pos || Vector.Zero,
            width: config.width || 512,
            height: config.height || 32,
            color: Color.Gray.clone(),
            anchor: Vector.Zero
        });

        this.text = text
        this.addName()

        this.on("pointerenter", () => this.select())
        this.on("pointerleave", () => this.deselect())
        this.on("pointerdown", () => {
            this.graphics.current.opacity = 1
            onClick(this)
        })

    }

    addName() {
        const size = Math.min(this.height / 2, this.width / this.text.length * 2)
        const label = new Label({
            name: this.name + "namePlate",
            text: this.text,
            font: new Font({
                size: size,
                textAlign: TextAlign.Center,
            }),
            width: this.width,
            height: this.height,
            pos: vec(this.width / 2, this.height / 2 - size / 2)
            // anchor: Vector.One.scale(-0.5)
        });

        this.addChild(label);
    }

    select() {
        this.graphics.current.opacity = 0.8
    }

    deselect() {
        this.graphics.current.opacity = 1
    }

}
