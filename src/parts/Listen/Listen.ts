import * as Command from '../Command/Command.ts'
import * as CommandMap from '../CommandMap/CommandMap.ts'
import * as HandleIpc from '../HandleIpc/HandleIpc.ts'
import * as IpcChild from '../IpcChild/IpcChild.ts'
import * as IpcChildType from '../IpcChildType/IpcChildType.ts'
import * as Rpc from '../Rpc/Rpc.ts'

export const listen = async () => {
  Command.register(CommandMap.commandMap)
  const ipc = await IpcChild.listen({ method: IpcChildType.Auto() })
  HandleIpc.handleIpc(ipc)
  Rpc.listen(ipc)
}
