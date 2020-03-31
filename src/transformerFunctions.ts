import { TransformerOptions } from './typings';

export function transformComponentPropsToSchema<T>(component: T, options?: TransformerOptions<T>) {}

export function transformTypeToSchema<T>(options?: TransformerOptions<T>) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {} as T;
}

export function transformTypeToPropTypes<T>(component: T) {}

type TypeKeysOptions<T> = Pick<
  TransformerOptions<T>,
  Exclude<keyof TransformerOptions<T>, 'maxDepth'>
>;

export function transformTypeToKeys<T>(options?: TypeKeysOptions<T>) {
  return ([] as unknown) as keyof T;
}