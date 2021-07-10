export enum PhrasaSymbol { 
  Beat = "beat",
  PitchEventValue = "pitch",
  FrequencyEventValue = "frequency",
  NoteEventValue = "note",
  SelectorSymbol = "#",
};

export enum Property {
  Pitch = "pitch",
  Tempo = "tempo",
  Length = "length",
  Branches = "branches",
  Events = "events",
  Event = "event",
  Sections = "sections",
  EventEndOffset = "end",
  EventStartOffset = "start",
  Sequences = "sequences",
  SectionsTotal = 'total',
  PitchGrid = 'grid',
  PitchZone = 'zone',
  SectionsEach = 'each'
};

export const KeyPrefixes: Map<string,Property> = new Map<string,Property>([
  ['>', Property.Sections],
  ['$', Property.Sequences],
  ['&', Property.Branches]
]);

export enum ExpressionSubject {
  Chord = 'chord',
  Scale = 'scale',
  Use = 'use'
}