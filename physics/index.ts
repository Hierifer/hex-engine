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
  pBodyMap = new Map<number, Matter.Body>();

  debugMode = false;

  constructor(target: string, options?: IPM_OPTIONS, debugMode = true) {
    this.target = target;
    this.options = this.options || options;
    this.debugMode = debugMode;
  }
  init(width: number, height: number) {
    // module aliases
    const Runner = Matter.Runner;

    this.options = { width, height };

    // create a renderer
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

    // run the renderer
    if (this.debugMode) this.Render.run(render);

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
  addObjs2World(objs: Array<Matter.Body>) {
    this.Composite.add(this.engine.world, objs);
  }
  removeObjsFromWorld(objs: Array<Matter.Body>) {
    this.Composite.remove(this.engine.world, objs);
  }
  loadScene(gameObjects: Array<GameObject>) {
    for (let i = 0; i < gameObjects.length; i++) {
      const curGO = gameObjects[i];
      const body = curGO.getPhysics2DBody();
      if (body !== null) {
        this.pBodyMap.set(curGO.id, body);
        this.addObjs2World([body]);
      } else {
        // 可能存在有 GO 没有物理对象
      }
    }
    return this;
  }
  getUpdatedMap() {
    const out = new Map<number, { pos: Matter.Vector; angle: number }>();
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
