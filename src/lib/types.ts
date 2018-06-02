export interface MapLike<T> {
  [index: string]: T;
}

/** fileName: string, fileContent: string */
export type FileTuple = [string, string];

export type FileTuples = [FileTuple];
