import {
  Component,
  SpriteComponent,
  Physics2DComponent,
  Physics2DColliderComponent,
  SpineComponent,
  SpineAnimatorComponent,
} from "./Component";
import { nanoid } from "nanoid";

import { fixNumber, recv } from "../utils/math";

export class GameObject {
  id = "";
  geo: GO_GEOMETRY = {
    posX: 0,
    posY: 0,
    rotX: 0,
    rotY: 0,
    scaleX: 1,
    scaleY: 1,
  };
  label = "";
  // prefab 是组的概念可以属于很多个组，方便物理引擎和逻辑查找
  prefab = "";
  attrs = { width: 100, height: 100 };
  components: Array<Component> = [];

  constructor(
    label: string,
    geo: Partial<GO_GEOMETRY>,
    attrs: Partial<{ width: number; height: number }>,
    prefab = ""
  ) {
    this.id = nanoid();
    this.label = label;
    this.geo = { ...this.geo, ...geo };
    this.attrs = { ...this.attrs, ...attrs };
    this.prefab = prefab;
  }
  _mountd() {}
  _destory() {}
  start() {}
  update() {}
  addComponents(comps: Array<Component>) {
    this.components = [...this.components, ...comps];
    return this;
  }
  setPosition(x: number, y: number) {
    this.geo.posX = x;
    this.geo.posY = y;
  }
  getId() {
    return this.id;
  }
  getGeoTop() {
    return this.geo.posY - this.attrs.height / 2;
  }
  getGeoBottom() {
    return this.geo.posY + this.attrs.height / 2;
  }
  findComponent(label: string) {
    return this.components.find((comp) => {
      return comp.label === label;
    });
  }
  getComponents() {
    return this.components;
  }
  getAnimator(): SpineAnimatorComponent | undefined {
    return this.findComponent("spineAnimator") as SpineAnimatorComponent;
  }
  // 可用来物理系统的同步
  setGeo({ pos, rot }: { pos: import("matter-js").Vector; rot: number }) {
    const [{ x, y }, rotX] = recv([pos, rot], fixNumber);
    this.geo.posX = x;
    this.geo.posY = y;
    this.geo.rotX = rotX;

    const phybody = this.findComponent("physics2d");

    if (
      phybody &&
      phybody instanceof Physics2DComponent &&
      (phybody.isStatic || phybody.body.isSleeping)
    ) {
      return;
    } else {
      let lockY = false;
      if (phybody && phybody instanceof Physics2DComponent) {
        lockY = phybody.lockY;
      }
      // effect 可优化成钩子
      const ro = this.findComponent("sprite");
      if (ro !== undefined && ro instanceof SpriteComponent) {
        if (lockY) {
          ro.setSprite("x", pos.x);
        } else {
          ro.setSprite("position", pos);
        }
        ro.setSprite("rotation", rot);
      }
      const spine = this.findComponent("spine");
      if (spine !== undefined && spine instanceof SpineComponent) {
        if (lockY) {
          //spine.setSpine(x, pos.x);
          spine.spine.x = pos.x;
        } else {
          spine.setSpine("position", pos);
        }
      }
    }
  }
  phySetStatic(isStatic: boolean) {
    const pcomp = this.findComponent("physics2d");
    if (pcomp !== void 0 && pcomp instanceof Physics2DComponent) {
      return pcomp.setStatic(isStatic);
    }
  }
  getPhysics2DBody() {
    const pcomp = this.findComponent("physics2d");
    if (pcomp !== void 0 && pcomp instanceof Physics2DComponent) {
      return pcomp.getBody();
    } else {
      return null;
    }
  }
  getPhysics2DComponent() {
    const pcomp = this.findComponent("physics2d");
    if (pcomp !== void 0 && pcomp instanceof Physics2DComponent) {
      return pcomp;
    } else {
      return null;
    }
  }
  getPhysics2DCollider() {
    const pcomp = this.findComponent("2dCollider");
    if (pcomp !== void 0 && pcomp instanceof Physics2DColliderComponent) {
      return pcomp.getCollider();
    } else {
      return null;
    }
  }
  removeComponents() {}
  getDebugObject() {
    return {
      id: this.id,
      name: this.label,
      geo: `${this.geo.posX}, ${this.geo.posY}`,
      comps: this.components.map((comp) => comp.label),
    };
  }
  static quick_distance(a: GameObject, b: GameObject) {
    return (
      Math.abs(a.geo.posX - b.geo.posX) + Math.abs(a.geo.posY - b.geo.posY)
    );
  }
}

export default GameObject;
