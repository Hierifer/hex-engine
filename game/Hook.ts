type AnyFunc = (...args: unknown[]) => void;

const HOOKS_NAME = [
  "onLoad",
  "onStart",
  "onUpdate",
  "onUpdateBeforePhysics",
  "onBeforeDestory",
  "onDestory",
] as const;
type TYPE_HOOK = (typeof HOOKS_NAME)[number];

export class Hook {
  onLoadList: AnyFunc[] = [];
  onStartList: AnyFunc[] = [];
  onUpdateList: AnyFunc[] = [];
  onUpdateBeforePhysicsList: AnyFunc[] = [];
  onBeforeDestoryList: AnyFunc[] = [];
  onDestoryList: AnyFunc[] = [];

  constructor() {
    this.__init();
  }
  __init() {
    // 获取游戏对象的 hooks
  }
  executeAll(hookName: TYPE_HOOK) {
    this[`${hookName}List`].forEach((hook) => {
      hook();
    });
  }
  onLoad(customFunc: (...args: unknown[]) => void) {
    if (typeof customFunc === "function") {
      this.onLoadList.push(customFunc);
    }
  }
  onStart(customFunc: (...args: unknown[]) => void) {
    if (typeof customFunc === "function") {
      this.onStartList.push(customFunc);
    }
  }
  onUpdateBeforePhysics(customFunc: (...args: unknown[]) => void) {
    if (typeof customFunc === "function") {
      this.onUpdateBeforePhysicsList.push(customFunc);
    }
  }
  onUpdate(customFunc: (...args: unknown[]) => void) {
    if (typeof customFunc === "function") {
      this.onUpdateList.push(customFunc);
    }
  }
  onBeforeDestory(customFunc: (...args: unknown[]) => void) {
    if (typeof customFunc === "function") {
      this.onBeforeDestoryList.push(customFunc);
    }
  }
  onDestory(customFunc: (...args: unknown[]) => void) {
    if (typeof customFunc === "function") {
      this.onDestoryList.push(customFunc);
    }
  }
}
