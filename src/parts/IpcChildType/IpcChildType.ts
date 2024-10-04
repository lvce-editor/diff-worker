export const ModuleWorker = 2
export const ModuleWorkerAndMessagePort = 8

export const Auto = () => {
  if (globalThis.acceptPort) {
    return MessagePort
  }
  if (globalThis.acceptReferencePort) {
    return ReferencePort
  }
  return ModuleWorkerAndMessagePort
}
