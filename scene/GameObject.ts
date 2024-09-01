import {
  Component,
  Physics2DComponent,
  Physics2DColliderComponent,
} from "./Component";
import { nanoid } from "nanoid";

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
  attrs = { width: 100, height: 100 };
  components: Array<Component> = [];
  constructor(
    label: string,
    geo: Partial<GO_GEOMETRY>,
    attrs: Partial<{ width: number; height: number }>
  ) {
    this.id = nanoid();
    this.label = label;
    this.geo = { ...this.geo, ...geo };
    this.attrs = { ...this.attrs, ...attrs };
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
  findComponent(label: string) {
    return this.components.find((comp) => {
      return comp.label === label;
    });
  }
  getPhysics2DBody() {
    const pcomp = this.findComponent("physics2d");
    if (pcomp !== void 0 && pcomp instanceof Physics2DComponent) {
      return pcomp.getBody();
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
}
export default GameObject;
