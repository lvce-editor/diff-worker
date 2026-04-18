import * as Diff from '../Diff/Diff.ts'
import * as DiffInline from '../DiffInline/DiffInline.ts'
import { handleMessagePort } from '../HandleMessagePort/HandleMessagePort.ts'

export const commandMap = {
  'Diff.diff': Diff.diff,
  'Diff.diffInline': DiffInline.diffInline,
  'Diff.handleMessagePort': handleMessagePort,
}
