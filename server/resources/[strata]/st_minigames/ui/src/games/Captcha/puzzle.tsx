export type ShapeName = 'square' | 'triangle' | 'rectangle' | 'circle'

export interface PuzzlePiece {
  index: number
  shape: ShapeName
  number: number
  text: [string, string] // [colorName text, shapeName text]
  colors: {
    background: string
    colortext: string
    shapetext: string
    number: string
    shape: string
  }
  colorNames: {
    background: string
    colortext: string
    shapetext: string
    number: string
    shape: string
  }
}

export const COLORS: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  blue: '#2195ee',
  red: '#7b0100',
  yellow: '#fceb3d',
  orange: '#fd9802',
  green: '#4cae4f',
  purple: '#9926ac',
}

const SHAPES: ShapeName[] = ['square', 'triangle', 'rectangle', 'circle']
const COLORABLE = ['background', 'colortext', 'shapetext', 'number', 'shape'] as const

const QUESTIONS: Record<string, (d: PuzzlePiece) => string> = {
  'background color': (d) => d.colorNames.background,
  'color text color': (d) => d.colorNames.colortext,
  'shape text color': (d) => d.colorNames.shapetext,
  'number color': (d) => d.colorNames.number,
  'shape color': (d) => d.colorNames.shape,
  'color text': (d) => d.text[0],
  'shape text': (d) => d.text[1],
  shape: (d) => d.shape,
}

function randInt(max: number): number {
  return Math.floor(Math.random() * max)
}
function sample<T>(arr: T[]): T {
  return arr[randInt(arr.length)]
}

export function randomizePiece(index: number): PuzzlePiece {
  const shape = sample(SHAPES)
  const number = randInt(9) + 1
  const colorText = sample(Object.keys(COLORS))
  const shapeText = sample(SHAPES)

  const colorNames: Record<string, string> = {}
  for (const k of COLORABLE) colorNames[k] = sample(Object.keys(COLORS))

  while (
    [colorNames.colortext, colorNames.shapetext].includes(colorNames.background)
  ) {
    colorNames.background = sample(Object.keys(COLORS))
  }
  while (
    [colorNames.background, colorNames.colortext, colorNames.shapetext, colorNames.number].includes(
      colorNames.shape,
    )
  ) {
    colorNames.shape = sample(Object.keys(COLORS))
  }

  const colors = {
    background: COLORS[colorNames.background],
    colortext: COLORS[colorNames.colortext],
    shapetext: COLORS[colorNames.shapetext],
    number: COLORS[colorNames.number],
    shape: COLORS[colorNames.shape],
  }

  return {
    index,
    shape,
    number,
    text: [colorText, shapeText],
    colors,
    colorNames: {
      background: colorNames.background,
      colortext: colorNames.colortext,
      shapetext: colorNames.shapetext,
      number: colorNames.number,
      shape: colorNames.shape,
    },
  }
}

export interface QuestionPart {
  question: string
  position: number
}

export function generateQA(
  count: number,
  positions: number[],
  puzzles: PuzzlePiece[],
): { parts: QuestionPart[]; answer: string } {
  const parts: QuestionPart[] = []
  const answers: string[] = []

  for (let i = 0; i < count; i++) {
    let pos = 0
    do {
      pos = positions[randInt(positions.length)]
    } while (!pos || parts.some((q) => q.position === pos))

    let que = ''
    do {
      que = sample(Object.keys(QUESTIONS))
    } while (!que || parts.some((q) => q.question === que))

    const piece = puzzles.find((p) => p.index === pos)
    if (!piece) continue
    answers.push(QUESTIONS[que](piece))
    parts.push({ question: que, position: pos })
  }

  return { parts, answer: answers.join(' ') }
}

export const SHAPE_SVG: Record<ShapeName, (color: string) => React.ReactElement> = {
  square: (c) => (
    <rect fill={c} stroke="#000" strokeWidth="1" width="150" height="150" />
  ),
  triangle: (c) => (
    <polygon fill={c} stroke="#000" strokeWidth="1" points="0 150 75 0 150 150 0 150" />
  ),
  rectangle: (c) => (
    <rect y="30" fill={c} stroke="#000" strokeWidth="1" width="150" height="90" />
  ),
  circle: (c) => (
    <circle fill={c} stroke="#000" strokeWidth="1" cx="75" cy="75" r="75" />
  ),
}
