import { PlainMessagePortRpc } from '@lvce-editor/rpc'
import { set } from '@lvce-editor/rpc-registry'

export const handleMessagePort = async (port: MessagePort, rpcId?: number): Promise<void> => {
  const rpc = await PlainMessagePortRpc.create({
    commandMap: {},
    messagePort: port,
  })
  if (rpcId) {
    set(rpcId, rpc)
  }
}
