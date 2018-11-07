import readFile from 'fs-readfile-promise';

export type FileTuple = [string, string];
export type FileTuples = FileTuple[];

export function readFiles(files: string[]): Promise<FileTuples> {
  const filePromises = files.map(file => readFile(file));
  return new Promise((resolve) => {
    Promise.all(filePromises).then(buffers => {
      const contents: string[][] = [];
      buffers.forEach(
          (buffer, index) => contents.push([files[index], buffer.toString()]));
      resolve(contents as FileTuples);
    });
  });
}