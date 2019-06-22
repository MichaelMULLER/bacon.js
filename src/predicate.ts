import { Property } from "./observable";
import _ from "./_";
import { mapT } from "./map";
import { Desc } from "./describe";
import Observable from "./observable";
import withLatestFrom from "./withlatestfrom";
import { composeT, Transformer } from "./transform";
import { Function1 } from "./types";

export type Predicate<V> = Function1<V, boolean>
/** @hidden */
export type PredicateOrBoolean<V> = Predicate<V> | boolean
export type PredicateOrProperty<V> = Predicate<V> | boolean | Property<boolean>

export type IsA<A, B extends A> = (x: A) => x is B

/** @hidden */
export function toPredicate<V>(f: PredicateOrBoolean<V>): Predicate<V> {
  if (typeof f == "boolean") {
    return _.always(f)
  } else if (typeof f != "function") {
    throw new Error("Not a function: " + f)
  } else {
    return f
  }
}

type Predicate2Transformer<V> = (p: Predicate<V>) => Transformer<V, V>

type BoolTuple<T> = [T, boolean]

/** @hidden */
export function withPredicate<V>(src: Observable<V>, f: PredicateOrProperty<V>, predicateTransformer: Predicate2Transformer<V>, desc: Desc): Observable<V> {
  if (f instanceof Property) {
    return withLatestFrom(src, f, (p, v) => <BoolTuple<V>>[p, v])
      .transform(composeT(<any>predicateTransformer(<any>((tuple: BoolTuple<V>) => tuple[1])), <any>mapT((tuple: BoolTuple<V>) => tuple[0])), desc)
      // the `any` type above is needed because the type argument for Predicate2Transformer is fixed. We'd need higher-kinded types to be able to express this properly, I think.
  }
  return src.transform(predicateTransformer(toPredicate(f)), desc)
}
