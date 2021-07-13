


export interface Sequence {
  endTime: number
  events: SequenceEvent[]
  grid: Grid
}

export interface Grid {
  rootNode: GridNode;
}

export interface GridNode {
  startTimeMs: number
  endTimeMs: number
  nodes: GridNode[] 
}

export class RangedValue {
  start : number
  end : number
  curve : number
}
export type EventValue = string | number | RangedValue;


export interface SequenceEvent {
  instrument: string
  startTimeMs: number
  durationMs :number
  values: Map<string,EventValue>
}