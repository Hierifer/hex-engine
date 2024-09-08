// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Singleton<T extends new (...args: any[]) => object>(
  obj: T
): InstanceType<typeof Proxy<T>> {
  let onlyOne = true;
  // @ts-expect-error any
  let self = null;

  return new Proxy(obj, {
    construct: function (target, args) {
      if (onlyOne) {
        onlyOne = false;
        self = Reflect.construct(target, args);
        return self;
      } else {
        console.error("only init once!");
        // @ts-expect-error any
        return self;
      }
    },
  });
}

export default Singleton;
