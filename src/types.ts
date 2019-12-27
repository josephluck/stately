export type RemoveFirstFromTuple<T extends any[]> = T["length"] extends 0
  ? []
  : ((...b: T) => any) extends (a, ...b: infer I) => any
  ? I
  : T;

export type DeepReadonly<T> = T extends {}
  ? {
      readonly [P in keyof T]: T[P] extends {}
        ? DeepReadonly<T[P]>
        : Readonly<T>;
    }
  : Readonly<T>;
