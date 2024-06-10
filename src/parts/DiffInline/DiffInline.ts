import * as Diff from '../Diff/Diff.ts'
import * as DiffType from '../DiffType/DiffType.ts'
import type { InlineDiffItem } from '../InlineDiffItem/InlineDiffItem.ts'

export const diffInline = (linesLeft: readonly string[], linesRight: readonly string[]): readonly InlineDiffItem[] => {
  const { changesLeft, changesRight } = Diff.diff(linesLeft, linesRight)
  const lengthLeft = linesLeft.length
  const lengthRight = linesRight.length
  const inlineDiffLinesLeft: number[] = []
  const inlineDiffLinesRight: number[] = []
  for (let i = 0; i < linesLeft.length; i++) {
    inlineDiffLinesLeft.push(DiffType.None)
  }
  for (let i = 0; i < linesRight.length; i++) {
    inlineDiffLinesRight.push(DiffType.None)
  }
  for (const change of changesLeft) {
    inlineDiffLinesLeft[change.index] = change.type
  }
  for (const change of changesRight) {
    inlineDiffLinesRight[change.index] = change.type
  }
  const merged: InlineDiffItem[] = []
  let leftIndex = 0
  let rightIndex = 0
  while (leftIndex < lengthLeft && rightIndex < lengthRight) {
    const left = inlineDiffLinesLeft[leftIndex]
    const right = inlineDiffLinesRight[rightIndex]
    if (left === right) {
      merged.push({
        leftIndex,
        rightIndex,
        type: DiffType.None,
      })
      leftIndex++
      rightIndex++
    } else if (left === DiffType.Deletion) {
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
        type: left,
      })
      leftIndex++
    } else if (leftIndex > rightIndex) {
      merged.push({
        leftIndex,
        rightIndex,
        type: right,
      })
    }
  }
  while (leftIndex < lengthLeft) {
    const left = inlineDiffLinesLeft[leftIndex]
    merged.push({
      leftIndex,
      rightIndex: -1,
      type: left,
    })
    leftIndex++
  }
  while (rightIndex < lengthRight) {
    const right = inlineDiffLinesRight[rightIndex]
    merged.push({
      leftIndex: -1,
      rightIndex,
      type: right,
    })
    rightIndex++
  }
  return merged
}
