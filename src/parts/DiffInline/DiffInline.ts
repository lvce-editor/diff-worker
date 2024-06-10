import * as Diff from '../Diff/Diff.ts'
import * as DiffType from '../DiffType/DiffType.ts'
import type { InlineDiffItem } from '../InlineDiffItem/InlineDiffItem.ts'

export const diffInline = (linesLeft: readonly string[], linesRight: readonly string[]): readonly InlineDiffItem[] => {
  const { changesLeft, changesRight } = Diff.diff(linesLeft, linesRight)
  const lengthLeft = linesLeft.length
  const lengthRight = linesRight.length
  const merged: InlineDiffItem[] = []
  let leftIndex = 0
  let rightIndex = 0
  while (leftIndex < lengthLeft && rightIndex < lengthRight) {
    const left = changesLeft[leftIndex]
    const right = changesRight[rightIndex]
    if (left.type === right.type) {
      merged.push({
        leftIndex,
        rightIndex,
        type: DiffType.None,
      })
      leftIndex++
      rightIndex++
    } else if (left.type === DiffType.Deletion) {
      merged.push({
        leftIndex,
        rightIndex,
        type: DiffType.Deletion,
      })
      leftIndex++
    } else if (leftIndex <= rightIndex) {
      merged.push({
        leftIndex,
        rightIndex,
        type: left.type,
      })
      leftIndex++
    } else if (leftIndex > rightIndex) {
      merged.push({
        leftIndex,
        rightIndex,
        type: right.type,
      })
    }
  }
  while (leftIndex < lengthLeft) {
    const left = changesLeft[leftIndex]
    merged.push({
      leftIndex,
      rightIndex: -1,
      type: left.type,
    })
    leftIndex++
  }
  while (rightIndex < lengthRight) {
    const right = changesRight[rightIndex]
    merged.push({
      leftIndex: -1,
      rightIndex,
      type: right.type,
    })
    rightIndex++
  }
  return merged
}
