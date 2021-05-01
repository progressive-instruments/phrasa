


export interface Sequence {
  endTime: number
  events: SequenceEvent[]
}

export class RangedValue {
  start : number
  end : number
  curve : number
}
export type EventValue = string | number | RangedValue;


export interface SequenceEvent {
  startTimeMs: number
  durationMs :number
  values: Map<string,EventValue>
}