import GameObject from "./GameObject";
import {
  SpriteComponent,
  GraphicComponent,
  Physics2DComponent,
} from "./Component";
import { Sprite, Assets, Graphics } from "pixi.js";
type Status = "pending" | "ready";
import Matter from "matter-js";
export abstract class Prefab {
  label = "";
  constructor(label: string) {
    this.label = label;
  }
  abstract generate(params: object): Promise<GameObject>;
}

export class GeometryPrefab extends Prefab {
  label = "";
  src = "";
  components = [];
  width = 0;
  height = 0;
  constructor(
    label: string,
    { width, height }: { width: number; height: number }
  ) {
    super(label);
    this.width = width;
    this.height = height;
  }

  /**
   * 生成对象
   * @param param0
   * @returns
   */
  generate({ x, y }: { x: number; y: number }) {
    return Promise.resolve().then(() => {
      const rect = new Graphics()
        .rect(x - this.width / 2, y - this.height / 2, this.width, this.height)
        .fill(0x000000);
      const wall = Matter.Bodies.rectangle(x, y, this.width, this.height, {
        isStatic: true,
      });
      return new GameObject(
        "wall",
        { posX: x, posY: y },
        { width: this.width, height: this.height }
      ).addComponents([
        new GraphicComponent(rect),
        new Physics2DComponent(wall),
      ]);
    });
  }
}

export class AsyncSpritePrefab extends Prefab {
  label = "";
  src = "";
  size = 20;
  components = [];
  sprite: Sprite | undefined;
  status: Status = "pending";
  onLoad: () => Promise<void>;
  onMount: () => Promise<void>;
  waitingList: Array<() => Promise<GameObject | void>>;
  constructor(
    label: string,
    { src, size }: { src?: string; size: number },
    onLoad = () => Promise.resolve(),
    onMount = () => Promise.resolve()
  ) {
    super(label);

    this.waitingList = [];
    this.size = size;
    this.onLoad = onLoad;
    this.onMount = onMount;
    Promise.resolve()
      .then(async () => {
        const texture = await Assets.load(src ?? this.src);

        // Create a new Sprite from an image path.
        this.sprite = new Sprite(texture);

        await this.onLoad();

        this.status = "ready";
      })
      .then(() => {
        this.waitingList.forEach((genTask) => {
          genTask();
        });
      });

    // 设置 physics
  }

  /**
   * 异步生成对象
   * @param param0
   * @returns
   */
  generate({ x, y }: { x: number; y: number }) {
    return new Promise<GameObject>(async (resolve) => {
      if (this.status === "ready" && this.sprite) {
        const box = Matter.Bodies.circle(x, y, 20, {}, 16);
        this.sprite.position.set(x, y);
        // Center the sprite's anchor point.
        this.sprite.anchor.set(0.5);
        this.sprite.setSize(this.size);

        await this.onMount();

        resolve(
          new GameObject(
            this.label,
            { posX: x, posY: y },
            { width: this.sprite!.width, height: this.sprite!.height }
          ).addComponents([
            new SpriteComponent(this.sprite),
            new Physics2DComponent(box),
          ])
        );
      } else {
        this.waitingList.push(() =>
          this.generate({ x, y }).then((res) => resolve(res))
        );
      }
    });
  }
}
