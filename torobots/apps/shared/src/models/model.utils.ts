import { Model, Document, Schema, SchemaDefinitionProperty } from "mongoose";

export class ObjectId extends Schema.Types.ObjectId {}

export type SchemaOf<T> = {
  [path in keyof T]: SchemaDefinitionProperty<T[path]>;
};

export interface ISafeModel<T> extends Model<T> {
  populateModel(object: any, unpopulatedFields?: boolean): Document<T>;
  safeCreate(initial: Partial<T>): Document<T>;
  safeRetrieve(id: string): Document<T>;
  safeRetrieveAll(): Document<T>[];
  safeUpdate(id: string, updates: Partial<T>): Document<T>;
  safeDelete(id: string): Document<T>;
}
