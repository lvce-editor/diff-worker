import * as IpcState from '../IpcState/IpcState.ts'

export const listen = (ipc) => {
  IpcState.set(ipc)
}
