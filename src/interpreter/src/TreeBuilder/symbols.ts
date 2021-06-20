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
  Phrases = "phrases",
  EventEndOffset = "end",
  EventStartOffset = "start",
  Sequences = "sequences",
  PhrasesTotal = 'total',
  PitchGrid = 'grid',
  PitchZone = 'zone',
  PhrasesEach = 'each'
};

export const KeyPrefixes: Map<string,Property> = new Map<string,Property>([
  ['>', Property.Phrases],
  ['$', Property.Sequences],
  ['&', Property.Branches]
]);

export enum ExpressionSubject {
  Chord = 'chord',
  Scale = 'scale'
}