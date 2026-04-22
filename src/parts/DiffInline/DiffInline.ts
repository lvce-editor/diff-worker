import * as Assert from '../Assert/Assert.ts'
import * as Diff from '../Diff/Diff.ts'
import * as DiffType from '../DiffType/DiffType.ts'
import type { InlineDiffItem } from '../InlineDiffItem/InlineDiffItem.ts'

const getAlignedIndex = (entry: Diff.AlignmentEntry | undefined): number => {
  return typeof entry === 'number' ? entry : -1
}

const addChangedBlock = (
  merged: InlineDiffItem[],
  leftStart: number,
  leftCount: number,
  rightStart: number,
  rightCount: number,
): void => {
  const pairedCount = Math.min(leftCount, rightCount)

  for (let index = 0; index < pairedCount; index++) {
    merged.push({
      leftIndex: leftStart + index,
      rightIndex: rightStart + index,
      type: DiffType.Deletion,
    })
    merged.push({
      leftIndex: leftStart + index,
      rightIndex: rightStart + index,
      type: DiffType.Insertion,
    })
  }

  for (let index = pairedCount; index < leftCount; index++) {
    merged.push({
      leftIndex: leftStart + index,
      rightIndex: -1,
      type: DiffType.Deletion,
    })
  }

  for (let index = pairedCount; index < rightCount; index++) {
    merged.push({
      leftIndex: -1,
      rightIndex: rightStart + index,
      type: DiffType.Insertion,
    })
  }
}

export const diffInline = (linesLeft: readonly string[], linesRight: readonly string[]): readonly InlineDiffItem[] => {
  Assert.array(linesLeft)
  Assert.array(linesRight)
  const lengthLeft = linesLeft.length
  const lengthRight = linesRight.length
  const { na } = Diff.getAlignmentMaps(linesLeft, linesRight)
  const matches: Array<{ leftIndex: number; rightIndex: number }> = []

  for (let rightIndex = 0; rightIndex < na.length; rightIndex++) {
    const leftIndex = getAlignedIndex(na[rightIndex])
    if (leftIndex !== -1) {
      matches.push({
        leftIndex,
        rightIndex,
      })
    }
  }

  const merged: InlineDiffItem[] = []
  let leftIndex = 0
  let rightIndex = 0

  for (const match of matches) {
    addChangedBlock(merged, leftIndex, match.leftIndex - leftIndex, rightIndex, match.rightIndex - rightIndex)
    merged.push({
      leftIndex: match.leftIndex,
      rightIndex: match.rightIndex,
      type: DiffType.None,
    })
    leftIndex = match.leftIndex + 1
    rightIndex = match.rightIndex + 1
  }

  addChangedBlock(merged, leftIndex, lengthLeft - leftIndex, rightIndex, lengthRight - rightIndex)

  return merged
}
