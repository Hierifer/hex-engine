import { Application, Assets, Sprite, Graphics, Polygon } from "pixi.js";
import PhysiceManager from "../physics/index";
import { GameObject } from "../scene/GameObject";
import {
  SpriteComponent,
  GraphicComponent,
  Physics2DComponent,
} from "../scene/Component";
import Matter from "matter-js";

import { DEFAULT_TARGET_LOC } from "../utils/constant";
import PhysicsManager from "../physics/index";

// 游戏逻辑之后移除
import { onStart, onUpdate } from "@/views/gameplay/script/gm";

// 对象类型定义
type GG_CONFIG = {
  target?: string;
  options?: GG_CONFIG_SIZE;
};
type GG_CONFIG_SIZE = {
  width: number;
  height: number;
};
type GG_CONFIG_DEBUG_OPTIONS = {
  showPhysics: boolean;
};

class GameGenerator {
  status = "init";
  targetLoc = DEFAULT_TARGET_LOC;
  app: Application;
  size: GG_CONFIG_SIZE = { width: 1000, height: 1000 };
  goManager: Array<GameObject> = new Array<GameObject>();
  phyManager: PhysicsManager;

  debugOptions: GG_CONFIG_DEBUG_OPTIONS = {
    showPhysics: false,
  };

  constructor(config: GG_CONFIG) {
    this.targetLoc = config.target || DEFAULT_TARGET_LOC;
    this.app = new Application();
    this._init();

    this.phyManager = new PhysiceManager(
      this.targetLoc,
      {},
      this.debugOptions.showPhysics
    );
  }
  async _init() {
    // Create a PixiJS application.
    await this.load();

    await this.mount();

    this.status = "mounted";

    this.update();

    // 初始化物理系统
    this.phyManager.init(this.app.screen.width, this.app.screen.height);
  }
  /**
   * 解
   */
  _destory() {}
  getDebugGameObjects() {
    return this.app.stage.getChildrenByLabel("Sprite");
  }
  mount() {
    // Then adding the application's canvas to the DOM body.
    if (this.targetLoc === DEFAULT_TARGET_LOC) {
      document.body.appendChild(this.app.canvas);
    } else {
      if (document.getElementById(this.targetLoc) !== null) {
        document.getElementById(this.targetLoc)?.appendChild(this.app.canvas);
      } else {
        // fallback
        this.targetLoc = DEFAULT_TARGET_LOC;
        document.body.appendChild(this.app.canvas);
      }
    }
  }
  resize() {}
  add2GameManager(go: GameObject) {
    if (
      this.goManager.find((tmp) => {
        return tmp.getId() === go.getId();
      }) !== undefined
    ) {
      // 去重
      return;
    }
    // Add to stage.
    if (go.findComponent("sprite") !== undefined) {
      const sprite = go.findComponent("sprite") as SpriteComponent;
      this.app.stage.addChild(sprite.getSprite());
    }
    if (go.findComponent("graphic") !== undefined) {
      const graphic = go.findComponent("graphic") as GraphicComponent;
      this.app.stage.addChild(graphic.getGraphic());
    }
    if (go.findComponent("physics2d") !== undefined) {
      this.phyManager.addObjs2World([go]);
    }
    this.goManager.push(go);
  }
  removeGameObject(uuid: string) {
    const go = this.goManager.find((go) => {
      return go.getId() === uuid;
    });
    if (go === undefined) {
      return;
    }
    const scomp = go.findComponent("sprite");
    if (scomp instanceof SpriteComponent) {
      this.app.stage.removeChild(scomp.getSprite());
    }
    const physics2d = go.findComponent("physics2d");
    if (physics2d instanceof Physics2DComponent) {
      this.phyManager.removeObjsFromWorld([physics2d.getBody()]);
    }
  }
  async load() {
    // Intialize the application.
    await this.app.init({
      background: "#1099bb",
      antialias: true,
      resizeTo: window,
    });

    // 之后动态加载
    onStart(this);

    // 添加墙体
    const id = 100;
    const WALLTHICK = 40;

    const width = this.app.screen.width;
    const height = this.app.screen.height;

    const wallG = new Graphics().rect(0, 0, 200, 100).fill(0xff0000);

    //create two boxes and a ground

    // const wallRight = Matter.Bodies.rectangle(
    //   width + WALLTHICK,
    //   height / 2,
    //   WALLTHICK,
    //   height,
    //   { isStatic: true }
    // );
    // const wallRGameObject = new GameObject(
    //   "wall",
    //   { posX: width + WALLTHICK / 2, posY: height / 2 },
    //   { width: WALLTHICK, height }
    // ).addComponents([new Physics2DComponent(wallRight)]);
    // this.goManager.push(wallRGameObject);

    // const ground = Matter.Bodies.rectangle(
    //   width / 2,
    //   height - 2 * WALLTHICK,
    //   width,
    //   WALLTHICK,
    //   { isStatic: true }
    // );
    // const ground2 = Matter.Bodies.rectangle(
    //   width / 2,
    //   height - 2 * WALLTHICK,
    //   width,
    //   WALLTHICK,
    //   { isStatic: true }
    // );
    // Matter.Body.setAngle(ground, 0.08);
    // Matter.Body.setAngle(ground2, -0.08);
    // const groundLGameObject = new GameObject(
    //   "wall",
    //   { posX: width / 4, posY: height },
    //   { width: width / 2, height: WALLTHICK }
    // ).addComponents([new Physics2DComponent(ground)]);
    // this.goManager.push(groundLGameObject);

    // const groundRGameObject = new GameObject(
    //   "wall",
    //   { posX: (width * 3) / 4, posY: height },
    //   { width: width / 2, height: WALLTHICK }
    // ).addComponents([new Physics2DComponent(ground2)]);
    // this.goManager.push(groundRGameObject);
  }

  async update() {
    // 游戏逻辑之后移除
    onUpdate();

    // Add an animation loop callback to the application's ticker.
    this.app.ticker.add((time) => {
      // physics update
      const updatedPhyMap = this.phyManager.getUpdatedMap();

      // GameObject 的 update 应该都执行在这里
      for (let i = 0; i < this.goManager.length; i++) {
        const curGO = this.goManager[i];
        const ro = curGO.findComponent("sprite");
        if (ro !== undefined && ro instanceof SpriteComponent) {
          ro.setSprite(
            "position",
            updatedPhyMap.get(curGO.id)?.pos || { x: 0, y: 0 }
          );
          ro.setSprite("rotation", updatedPhyMap.get(curGO.id)?.angle || 0);
        }
      }
      updatedPhyMap.clear();

      // const bunny = this.app.stage.getChildAt(0)

      // if(bunny){
      //     bunny.rotation += 0.1 * time.deltaTime;
      // }

      if (document.getElementById("debugObject")) {
        document.getElementById("debugObject")!.innerHTML = this.app.stage
          .getChildrenByLabel("Sprite")
          .reduce((prev, cur) => {
            return prev + "," + cur.label;
          }, "");
      }
    });
  }
}

export default GameGenerator;
