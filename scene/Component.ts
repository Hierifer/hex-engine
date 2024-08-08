import { Sprite, Graphics } from "pixi.js";
import GameObject from "./GameObject";

/**
 * GameObject 组件基类
 */
export class Component {
  label = "";
  constructor(label: string) {
    this.label = label;
  }
  add2GameObject(go: GameObject) {
    go.addComponents([this]);
  }
}

/**
 * 图片组件类 - 继承自 Component
 */
export class SpriteComponent extends Component {
  sprite: Sprite;

  constructor(sprite: Sprite) {
    super("sprite");
    this.sprite = sprite;
  }

  getSprite() {
    return this.sprite;
  }

  setSprite(key: string, value: any) {
    this.sprite[key] = value;
  }
}

/**
 * 基础片源类 - 继承自 Component
 */
export class GraphicComponent extends Component {
  graphic: Graphics;

  constructor(graphic: Graphics) {
    super("graphic");
    this.graphic = graphic;
  }

  getGraphic() {
    return this.graphic;
  }

  setGraphic(key: string, value: any) {
    this.graphic[key] = value;
  }
}

export class Physics2DComponent extends Component {
  body: Matter.Body;
  constructor(body: Matter.Body) {
    super("physics2d");
    this.body = body;
  }

  getBody() {
    return this.body;
  }
}
