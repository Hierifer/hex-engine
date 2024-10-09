import { Application } from "pixi.js";
import PhysiceManager from "../physics/index";
import { CollisionInfo } from "../physics/index";
import { GameObject } from "../scene/GameObject";
import {
  SpriteComponent,
  GraphicComponent,
  Physics2DComponent,
  Physics2DColliderComponent,
  SpineComponent,
} from "../scene/Component";

import { DEFAULT_TARGET_LOC } from "../utils/constant";
import PhysicsManager from "../physics/index";

const DebugWarningPrint = true;

const log = (() => {
  if (DebugWarningPrint) {
    return (content: string | object | Array<unknown>, allowPrint: boolean) => {
      if (!allowPrint) {
        return;
      }
      let returnTxt = content.toString();
      if (typeof content === "object") {
        try {
          returnTxt = JSON.stringify(content);
        } catch (e) {
          // downgrade toString
          returnTxt = content.toString();
        }
      }
      //console.log(returnTxt);
    };
  } else {
    return () => {};
  }
})();

// 游戏逻辑之后移除
import { onStart, onPrepare, onUpdate } from "@/views/gameplay/script/gm";

// 对象类型定义
type GG_CONFIG = {
  target?: string;
  options?: {
    width?: number;
    height?: number;
    debugSignal?: Function;
    baseSignalSend?: Function;
  };
};
type GG_CONFIG_SIZE = {
  width: number;
  height: number;
};

class GameGenerator {
  status = "init";
  targetLoc = DEFAULT_TARGET_LOC;
  app: Application;
  size: GG_CONFIG_SIZE = { width: 1000, height: 1000 };
  goManager: Array<GameObject> = new Array<GameObject>();
  phyManager: PhysicsManager;
  collisionEffect = new Map<string, (t: CollisionInfo) => void>();
  debugSignal = new Function();
  baseSignalSend = new Function();

  debugOptions = {
    showPhysics: false,
    updateGOPanel: true,
  };

  constructor(config: GG_CONFIG) {
    this.targetLoc = config.target || DEFAULT_TARGET_LOC;
    this.debugSignal = config.options?.debugSignal || this.debugSignal;
    this.baseSignalSend = config.options?.baseSignalSend || this.baseSignalSend;
    this.app = new Application();
    this._init();

    this.phyManager = new PhysiceManager(
      this.targetLoc,
      {},
      this.debugOptions.showPhysics
    );
  }
  async _init() {
    await this.load();
    this.update();

    // 初始化物理系统
    this.phyManager.init(this.app.screen.width, this.app.screen.height);
  }
  debugPhysics() {
    this.debugOptions.showPhysics = !this.debugOptions.showPhysics;
    this.phyManager.setDebugMode(this.debugOptions.showPhysics);
  }
  restart() {
    this.unmount();
    this.goManager = new Array<GameObject>();
    this.app = new Application();
    this._init();

    this.phyManager = new PhysiceManager(
      this.targetLoc,
      {},
      this.debugOptions.showPhysics
    );
  }
  _soft_destory() {}
  /**
   * 解
   */
  _destory() {
    // this.app.
    // this.phyManager
  }
  stop() {
    this.app.ticker.stop();
  }
  getDebugGameObjects() {
    return this.goManager;
  }
  resize() {}
  createCollisionDetector(space: string, func: (c: CollisionInfo) => void) {
    this.collisionEffect.set(space, func);
    return this.phyManager.createDetector(space);
  }
  addCollisionListener(space: string, gameObject: GameObject) {
    const dSpace = this.phyManager.findDetector(space);
    const curBody = gameObject.getPhysics2DBody();
    if (curBody) {
      dSpace && dSpace.bodies.push(curBody);
    }
    return;
  }
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
    if (go.findComponent("spine") !== undefined) {
      const spine = go.findComponent("spine") as SpineComponent;
      this.app.stage.addChild(spine.getSpine());
    }
    if (go.findComponent("graphic") !== undefined) {
      const graphic = go.findComponent("graphic") as GraphicComponent;
      this.app.stage.addChild(graphic.getGraphic());
    }
    if (go.findComponent("physics2d") !== undefined) {
      this.phyManager.addObjs2World([go]);
    }
    if (go.findComponent("2dCollider") !== undefined) {
      const collider = go.findComponent(
        "2dCollider"
      ) as Physics2DColliderComponent;
      this.addCollisionListener(collider.space, go);
    }
    // TO-DO auto detect collider
    this.goManager.push(go);
  }
  removeGameObject(uuid: string | undefined) {
    if (!uuid) {
      return;
    }
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
      this.phyManager.removeObjsFromWorld([go]);
    }
    this.goManager.splice(this.goManager.indexOf(go), 1);
  }
  getGameObjectByPrefab(prefab: string) {
    return this.goManager.filter((go) => {
      return go.prefab === prefab;
    });
  }
  getGameObjectByLabel(label: string) {
    return this.goManager.filter((go) => {
      return go.label === label;
    });
  }
  getGameObjectById(uuid: string) {
    return this.goManager.find((go) => {
      return go.getId() === uuid;
    });
  }
  getGameObjectByPhysicsBodyId(bodyId: number) {
    const ogid = this.phyManager.getOGidByBodyId(bodyId.toString());
    if (ogid) {
      return this.getGameObjectById(ogid);
    }
    return undefined;
  }
  sendSignal(event: string, param: Record<string, string>) {
    if (typeof this.baseSignalSend === "function") {
      this.baseSignalSend(event, param);
    }
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
  unmount() {
    this.app.canvas.remove();
  }
  async load() {
    // Intialize the application.
    await this.app.init({
      background: "#1099bb",
      antialias: true,
      resizeTo: window,
    });
    this.size = {
      width: this.app.screen.width,
      height: this.app.screen.height,
    };
    await onPrepare(this);
    this.mount();
    // 之后动态加载
    onStart(this);
    this.status = "mounted";
  }

  async update() {
    // 游戏逻辑之后移除
    let lastDetecor = 0;

    this.app.ticker.add(async (time) => {
      // onUpdateBeforePhysics();

      // 物理自动更新
      // 第一次定位由物理同步，如需手动需设置 init 为 true
      const updatedPhyMap = this.phyManager.getUpdatedMap();

      for (let i = 0; i < this.goManager.length; i++) {
        const curGO = this.goManager[i];
        const phybody = curGO.findComponent("physics2d");
        if (
          phybody &&
          phybody instanceof Physics2DComponent &&
          (phybody.isStatic || phybody.isSleeping)
        ) {
          continue;
        }
        curGO.setGeo({
          pos: updatedPhyMap.get(curGO.id)?.pos || { x: 0, y: 0 },
          rot: updatedPhyMap.get(curGO.id)?.angle || 0,
        });
      }
      updatedPhyMap.clear();

      // 物理碰撞更新：开发者逻辑
      const detectPeriod = Math.floor(time.lastTime / 50);
      if (detectPeriod !== lastDetecor) {
        [...this.collisionEffect.keys()].forEach((space) => {
          const col = this.phyManager.triggerDetector(space);
          const effect = this.collisionEffect.get(space);
          if (effect) effect(col);
        });
        lastDetecor = detectPeriod;
      }

      // Gameplay 逻辑
      await onUpdate(this, time);

      // Debug 信号
      this.debugSignal(time.lastTime);
    });
  }
}

export default GameGenerator;
