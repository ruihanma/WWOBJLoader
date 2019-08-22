import {
  LoadingManager,
  Group,
  Object3D
} from '../../node_modules/three/src/Three';

import { OBJLoader2Parser } from './worker/parallel/OBJLoader2Parser';
import { MaterialHandler } from './shared/MaterialHandler';
import { MeshReceiver} from './shared/MeshReceiver';

export class OBJLoader2 extends OBJLoader2Parser {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  modelName: string;
  instanceNo: number;
  path: string;
  resourcePath: string;
  baseObject3d: Group;
  materialHandler: MaterialHandler;
  meshReceiver: MeshReceiver;

  setModelName(modelName: string): this;
  setPath(path: string): this;
  setResourcePath(path: string): this;
  setBaseObject3d(baseObject3d: Object3D): this;
  addMaterials(materials: object): this;
  setCallbackOnMeshAlter(onMeshAlter: Function): this;
  setCallbackOnLoadMaterials(onLoadMaterials: Function): this;
  load(url: string, onLoad: (group: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void, onMeshAlter?: (meshData: object) => void): void;
  parse(content: ArrayBuffer | string): void;
}
