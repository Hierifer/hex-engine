// https://github.com/liabru/matter-js/wiki/Getting-started
// https://brm.io/matter-js/docs/
import Matter from "matter-js";
import GameObject from "../scene/GameObject";
import { DEFAULT_TARGET_LOC } from "../utils/constant";

type IPM_OPTIONS = {
  width?: number;
  height?: number;
};

export type CollisionInfo =
  | {
      nnid: { bodyA: string | undefined; bodyB: string | undefined };
      data: Matter.Collision;
    }[];

// const filterArray = <T>(arr: T[], removed: T, func: (a: T, b: T) => boolean) => {
//   let curIndex = 0;
//   let c = 0;
//   while (curIndex < arr.length) {
//     if (func(arr[c], removed)) {
//       arr[curIndex] = arr[c];
//       curIndex++;
//     }
//     c++;
//   }
// };

class PhysicsManager {
  Engine = Matter.Engine;
  Bodies = Matter.Bodies;
  Composite = Matter.Composite;
  Render = Matter.Render;
  // create an engine
  engine = this.Engine.create();
  private target = DEFAULT_TARGET_LOC;
  options = { width: 1000, height: 1000 };
  pBodyMap = new Map<string, Matter.Body>();
  rpBodyMap = new Map<string, string>();
  collisionSpaces = new Map<string, Matter.Detector>();

  debugMode = false;

  constructor(target: string, options?: IPM_OPTIONS, debugMode = false) {
    this.target = target;
    this.options = this.options || options;
    this.debugMode = debugMode;
  }
  init(width: number, height: number) {
    // module aliases
    const Runner = Matter.Runner;

    this.options = { width, height };

    // create a renderer

    // run the renderer
    if (this.debugMode) {
      const render = this.Render.create({
        element: document.getElementById(this.target)!,
        engine: this.engine,
        options: {
          width,
          height,
          wireframes: false,
          background: "transparent",
        },
      });
      render.canvas.style.position = "absolute";
      render.canvas.style.top = "0px";
      this.Render.run(render);
    }

    // create runner
    const runner = Runner.create();

    // run the engine
    Runner.run(runner, this.engine);

    return this;
  }
  createDetector(space: string) {
    const detector = Matter.Detector.create();
    this.collisionSpaces.set(space, detector);
    return detector;
  }
  findDetector(space: string) {
    return this.collisionSpaces.get(space);
  }
  setDebugMode(enable: boolean) {
    this.debugMode = enable;
    // TO-DO need fix
  }
  triggerDetector(space: string): CollisionInfo {
    const tmp = this.collisionSpaces.get(space);

    const cols = tmp && Matter.Detector.collisions(tmp);

    if (cols) {
      // format cols
      return cols.map((col) => {
        return {
          data: col,
          nnid: {
            bodyA: this.rpBodyMap.get(col.bodyA.id.toString()),
            bodyB: this.rpBodyMap.get(col.bodyB.id.toString()),
          },
        };
      });
    }

    return [];
  }
  deleteBodyByGOId(gameObjectId: string) {
    const bodyId = this.pBodyMap.get(gameObjectId);
    if (bodyId) {
      this.pBodyMap.delete(gameObjectId);
      this.rpBodyMap.delete(bodyId.id.toString());
    }
  }
  deleteBodyByBodyId(physicsId: string) {
    const goId = this.rpBodyMap.get(physicsId);
    if (goId) {
      this.pBodyMap.delete(goId);
      this.rpBodyMap.delete(physicsId);
    }
  }

  /**
   * 移除
   * @param gameObjects
   * @param param1
   */
  removeObjsFromWorld(gameObjects: Array<GameObject>) {
    const waitDeletes = new Array<Matter.Body>();
    for (let i = 0; i < gameObjects.length; i++) {
      const curGO = gameObjects[i];
      const body = curGO.getPhysics2DBody();
      const collider = curGO.getPhysics2DCollider();
      if (
        collider &&
        this.findDetector(collider.space) &&
        this.findDetector(collider.space)!.bodies !== undefined
      ) {
        let curIndex = 0;
        let found = -1;
        const tmp = this.findDetector(collider.space)!.bodies;
        while (curIndex < tmp.length) {
          if (tmp[curIndex].id === collider.body.id) {
            found = curIndex;
          }
          curIndex++;
        }

        tmp.splice(found, 1);
        console.log(tmp);
        Matter.Detector.setBodies(this.findDetector(collider.space)!, tmp);
        console.log(this.findDetector(collider.space)!.bodies);
        console.log(collider);
        console.log(found);
        console.log("done!");
      }
      if (body !== null) {
        this.deleteBodyByGOId(curGO.id);
        waitDeletes.push(body);
      }
    }
    this.Composite.remove(this.engine.world, waitDeletes);
    return this;
  }

  /**
   * 将一组游戏对象（GameObjects）添加到物理世界中，并建立它们的 ID 与物理身体（Physics Bodies）的映射
   * 如果游戏对象没有关联的物理身体，则忽略它
   * 添加完成后，返回当前的 Composite 实例，以便进行链式调用
   *
   * @param gameObjects - 一个包含多个 GameObject 的数组
   * @return this，用于方法链式调用
   * @throws 当 gameObjects 参数不是一个数组或数组长度为 0 时，抛出错误
   * @date:[日期]
   */
  addObjs2World(gameObjects: Array<GameObject>) {
    const objs = new Array<Matter.Body>();
    for (let i = 0; i < gameObjects.length; i++) {
      const curGO = gameObjects[i];
      const body = curGO.getPhysics2DBody();
      if (body !== null) {
        this.pBodyMap.set(curGO.id, body);
        this.rpBodyMap.set(body.id.toString(), curGO.id);
        objs.push(body);
      } else {
        // 可能存在有 GO 没有物理对象
      }
    }
    this.Composite.add(this.engine.world, objs);
    return this;
  }
  getUpdatedMap() {
    const out = new Map<string, { pos: Matter.Vector; angle: number }>();
    const keys = [...this.pBodyMap.keys()];
    for (let i = 0; i < keys.length; i++) {
      const pBody = this.pBodyMap.get(keys[i]);
      if (pBody !== void 0) {
        out.set(keys[i], { pos: pBody.position, angle: pBody.angle });
      }
    }
    return out;
  }
}

export default PhysicsManager;
