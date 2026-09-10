export type Direction = 'above' | 'below'

export interface Rate {
  pair: string
  rate: number
  asOf: string
}

export interface Alert {
  id: string
  pair: string
  threshold: number
  direction: Direction
  triggered: boolean
}

export interface CreateAlertInput {
  pair: string
  threshold: number
  direction: Direction
}
