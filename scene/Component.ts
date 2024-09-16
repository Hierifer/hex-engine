import { Sprite, Graphics } from "pixi.js";
import { Spine } from "@pixi/spine-pixi";
import GameObject from "./GameObject";
import GameGenerator from "../game";
import Matter from "matter-js";

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

  setSprite(key: string, value: unknown) {
    // @ts-expect-error: use it later
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

  setGraphic(key: string, value: unknown) {
    // @ts-expect-error: use it later
    this.graphic[key] = value;
  }
}

export class Physics2DComponent extends Component {
  body: Matter.Body;
  lockY: boolean = false;
  constructor(body: Matter.Body) {
    super("physics2d");
    this.body = body;
  }

  getBody() {
    return this.body;
  }
  get isStatic() {
    return this.body.isStatic;
  }

  get isSleeping() {
    return this.body.isSleeping;
  }

  setLockY(lock: boolean) {
    this.lockY = lock;
  }

  setBody(key: string, value: unknown) {
    // @ts-expect-error: use it later
    this.body[key] = value;
  }
  setStatic(isStatic: boolean) {
    Matter.Body.setStatic(this.body, isStatic);
  }
}

export class Physics2DColliderComponent extends Component {
  space: string;
  body: Matter.Body;
  constructor(space: string, mBody: Matter.Body) {
    super("2dCollider");
    this.space = space;
    this.body = mBody;
  }
  getCollider() {
    return { space: this.space, body: this.body };
  }
}

type Geovector = {
  x: number;
  y: number;
};
export class SpineComponent extends Component {
  spine: Spine;
  options: Geovector;

  constructor(spine: Spine, options?: Geovector) {
    super("spine");
    this.spine = spine;
    this.options = options ?? { x: 0, y: 0 };
  }

  getSpine() {
    return this.spine;
  }

  setSpine(key: string, value: Geovector) {
    if (key === "position") {
      // add anchor offset
      this.spine[key] = {
        x: value.x + this.options.x,
        y: value.y + this.options.y,
      };
    } else {
      // @ts-expect-error: use it later
      this.spine[key] = value;
    }
  }
}

const animationMap = {
  idle: {
    name: "idle",
    loop: true,
  },
  walk: {
    name: "walk",
    loop: true,
  },
  run: {
    name: "run",
    loop: true,
  },
  jump: {
    name: "jump",
    timeScale: 1.5,
  },
  hover: {
    name: "hoverboard",
    loop: true,
  },
  spawn: {
    name: "portal",
  },
} as const;

export class SpineAnimatorComponent extends Component {
  spine: Spine;
  spine_meta = { scale: 1 };
  state = {
    walk: false,
    run: false,
    hover: false,
    jump: false,
  };
  constructor(spine: Spine) {
    super("spineAnimator");
    this.spine = spine;
    this.spine_meta.scale = this.spine.scale.x;
    this.spine.state.data.defaultMix = 0.2;
  }

  spawn(pos?: Geovector) {
    this.spine.state.clearTracks();

    return this.playAnimationAsync({
      name: animationMap.spawn.name,
      loop: false,
      timeScale: 1,
    });
  }
  get currentAnimationName() {
    return this.spine?.state?.getCurrent(0)?.animation?.name;
  }

  update() {
    // Play the jump animation if not already playing.
    // if (this.state.jump) this.playAnimation(animationMap.jump);
    // Skip the rest of the animation updates during the jump animation.
    if (
      this.isAnimationPlaying(animationMap.jump) ||
      this.isAnimationPlaying(animationMap.spawn)
    )
      return;

    // Handle the character animation based on the latest state and in the priority order.
    if (this.state.hover) this.playAnimation(animationMap.hover);
    else if (this.state.run) this.playAnimation(animationMap.run);
    else if (this.state.walk) this.playAnimation(animationMap.walk);
    else this.playAnimation(animationMap.idle);
  }
  isAnimationPlaying({ name }: { name: string }) {
    // Check if the current animation on main track equals to the queried.
    // Also check if the animation is still ongoing.
    return (
      this.currentAnimationName === name &&
      !this.spine.state.getCurrent(0)?.isComplete()
    );
  }
  get direction() {
    return this.spine.scale.x > 0 ? 1 : -1;
  }

  set direction(value) {
    this.spine.scale.x = value * this.spine_meta.scale;
  }

  playAnimation({
    name,
    loop = false,
    timeScale = 1,
  }: {
    name: (typeof animationMap)[keyof typeof animationMap]["name"];
    loop?: boolean;
    timeScale?: number;
  }) {
    // Skip if the animation is already playing.
    if (this.currentAnimationName === name) return;

    // Play the animation on main track instantly.
    const trackEntry = this.spine.state.setAnimation(0, name, loop);
    // Apply the animation's time scale (speed).
    trackEntry.timeScale = timeScale;
  }

  playAnimationAsync({
    name,
    loop = false,
    timeScale = 1,
  }: {
    name: (typeof animationMap)[keyof typeof animationMap]["name"];
    loop?: boolean;
    timeScale?: number;
  }) {
    return new Promise((resolve) => {
      this.playAnimation({ name, loop, timeScale });
      const listener = {
        complete: () => {
          this.spine.state.removeListener(listener);
          resolve(true);
        },
      };
      this.spine.state.addListener(listener);
    });
  }
}

export class CustomScriptComponent extends Component {
  customOnStart: ((gm: GameGenerator) => {}) | undefined;
  customOnUpdate: ((gm: GameGenerator) => {}) | undefined;

  constructor(
    scriptName: string,
    customOnStart?: (gm: GameGenerator) => {},
    customOnUpdate?: (gm: GameGenerator) => {}
  ) {
    super(scriptName);
    // 优化自动读取各个钩子函数
    this.customOnStart = customOnStart;
    this.customOnUpdate = customOnUpdate;
  }

  onStart(gm: GameGenerator) {
    if (this.customOnStart === undefined) {
      return;
    }
    this.customOnStart(gm);
  }

  onUpdate(gm: GameGenerator) {
    if (this.customOnUpdate === undefined) {
      return;
    }
    this.customOnUpdate(gm);
  }
}