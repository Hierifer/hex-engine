// https://github.com/liabru/matter-js/wiki/Getting-started
// https://brm.io/matter-js/docs/
import Matter from "matter-js";
import GameObject from "../scene/GameObject";
import { DEFAULT_TARGET_LOC } from "../utils/constant";

type IPM_OPTIONS = {
  width?: number;
  height?: number;
};

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

  setDebugMode(enable: boolean) {
    this.debugMode = enable;
    // TO-DO need fix
  }

  /**
   * 移除
   * @param gameObjects
   * @param param1
   */
  removeObjsFromWorld(gameObjects: Array<GameObject>) {
    const objs = new Array<Matter.Body>();
    for (let i = 0; i < gameObjects.length; i++) {
      const curGO = gameObjects[i];
      const body = curGO.getPhysics2DBody();
      if (body !== null) {
        this.pBodyMap.delete(curGO.id);
        objs.push(body);
      }
    }
    this.Composite.remove(this.engine.world, objs);
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
