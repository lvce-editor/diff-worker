export const ModuleWorker = 2
export const ModuleWorkerAndMessagePort = 8

export const Auto = () => {
  if (globalThis.acceptPort) {
    return MessagePort
  }
  return ModuleWorkerAndMessagePort
}
