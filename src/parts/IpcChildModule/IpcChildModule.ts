import * as IpcChildType from '../IpcChildType/IpcChildType.ts'
import { IpcChildWithModuleWorker, IpcChildWithModuleWorkerAndMessagePort } from '@lvce-editor/ipc/dist/browser.js'

export const getModule = (method) => {
  switch (method) {
    case IpcChildType.ModuleWorker:
      return IpcChildWithModuleWorker
    case IpcChildType.ModuleWorkerAndMessagePort:
      return IpcChildWithModuleWorkerAndMessagePort
    default:
      throw new Error('unexpected ipc type')
  }
}
