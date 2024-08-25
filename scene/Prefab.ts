import GameObject from "./GameObject";
import {
  Component,
  SpriteComponent,
  GraphicComponent,
  Physics2DComponent,
  Physics2DColliderComponent,
} from "./Component";
import { Sprite, Assets, Graphics, FederatedPointerEvent } from "pixi.js";
type Status = "pending" | "ready";
import Matter from "matter-js";

export abstract class Prefab {
  label = "";
  constructor(label: string) {
    this.label = label;
  }
  abstract generate(params: object): Promise<GameObject>;
}

// const defaultEvent = () => {
//   return (t: FederatedPointerEvent) => {
//     console.log("illegal event: " + t.detail);
//   };
// };

/**
 * 游戏预制件，可以理解为 GameObject 工厂
 *
 */
export class GeometryPrefab extends Prefab {
  label = "";
  src = "";
  components = [];
  width = 0;
  height = 0;
  background = 0x000000;
  onHover: ((t: FederatedPointerEvent) => void) | undefined;
  onClick: ((t: FederatedPointerEvent) => void) | undefined;
  onPointerout: ((t: FederatedPointerEvent) => void) | undefined;
  onPointermove: ((t: FederatedPointerEvent) => void) | undefined;
  constructor(
    label: string,
    {
      width,
      height,
      background,
      onClick,
      onHover,
      onPointerout,
      onPointermove,
    }: {
      width: number;
      height: number;
      background?: number | string;
      onClick?: (t: FederatedPointerEvent) => void;
      onHover?: (t: FederatedPointerEvent) => void;
      onPointerout?: (t: FederatedPointerEvent) => void;
      onPointermove?: (t: FederatedPointerEvent) => void;
    }
  ) {
    super(label);
    this.width = width;
    this.height = height;
    // @ts-expect-error: use it later
    this.background = background || 0x000000;

    this.onClick = onClick;
    this.onHover = onHover;
    this.onPointerout = onPointerout;
    this.onPointermove = onPointermove;
  }

  /**
   * 生成对象
   * @param param0
   * @returns
   */
  generate({ x, y, space }: { x: number; y: number; space?: string }) {
    return Promise.resolve().then(() => {
      const rect = new Graphics()
        .rect(x - this.width / 2, y - this.height / 2, this.width, this.height)
        .fill(this.background || 0x000000)
        .stroke({ width: 1, color: 0xffd900 });
      //   rect.eventMode = "static";
      //   rect.cursor = "pointer";
      if (this.onClick) rect.on("pointerdown", this.onClick);
      if (this.onHover) rect.on("pointerover", this.onHover);
      if (this.onPointermove) rect.on("pointermove", this.onPointermove);
      if (this.onPointerout) rect.on("pointerout", this.onPointerout);

      rect.eventMode = "static";
      const staticBody = Matter.Bodies.rectangle(
        x,
        y,
        this.width,
        this.height,
        {
          isStatic: true,
        }
      );
      const components: Component[] = [
        new GraphicComponent(rect),
        new Physics2DComponent(staticBody),
      ];
      if (space) {
        components.push(new Physics2DColliderComponent(space, staticBody));
      }
      return new GameObject(
        this.label,
        { posX: x, posY: y },
        { width: this.width, height: this.height }
      ).addComponents(components);
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
