// package: shift_processor
// file: note_message.proto

import * as jspb from "google-protobuf";

export class ShiftPlayerMessage extends jspb.Message {
  hasSetsequence(): boolean;
  clearSetsequence(): void;
  getSetsequence(): SetSequenceMessage | undefined;
  setSetsequence(value?: SetSequenceMessage): void;

  hasSetplaymode(): boolean;
  clearSetplaymode(): void;
  getSetplaymode(): SetPlayMode | undefined;
  setSetplaymode(value?: SetPlayMode): void;

  hasGetplayerstate(): boolean;
  clearGetplayerstate(): void;
  getGetplayerstate(): EmptyMessage | undefined;
  setGetplayerstate(value?: EmptyMessage): void;

  getMessageCase(): ShiftPlayerMessage.MessageCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ShiftPlayerMessage.AsObject;
  static toObject(includeInstance: boolean, msg: ShiftPlayerMessage): ShiftPlayerMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ShiftPlayerMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ShiftPlayerMessage;
  static deserializeBinaryFromReader(message: ShiftPlayerMessage, reader: jspb.BinaryReader): ShiftPlayerMessage;
}

export namespace ShiftPlayerMessage {
  export type AsObject = {
    setsequence?: SetSequenceMessage.AsObject,
    setplaymode?: SetPlayMode.AsObject,
    getplayerstate?: EmptyMessage.AsObject,
  }

  export enum MessageCase {
    MESSAGE_NOT_SET = 0,
    SETSEQUENCE = 1,
    SETPLAYMODE = 2,
    GETPLAYERSTATE = 3,
  }
}

export class ShiftPlayerResponse extends jspb.Message {
  getStatus(): ResponseStatusMap[keyof ResponseStatusMap];
  setStatus(value: ResponseStatusMap[keyof ResponseStatusMap]): void;

  hasNone(): boolean;
  clearNone(): void;
  getNone(): EmptyMessage | undefined;
  setNone(value?: EmptyMessage): void;

  hasGetstatusdata(): boolean;
  clearGetstatusdata(): void;
  getGetstatusdata(): GetStatusData | undefined;
  setGetstatusdata(value?: GetStatusData): void;

  getDataCase(): ShiftPlayerResponse.DataCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ShiftPlayerResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ShiftPlayerResponse): ShiftPlayerResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ShiftPlayerResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ShiftPlayerResponse;
  static deserializeBinaryFromReader(message: ShiftPlayerResponse, reader: jspb.BinaryReader): ShiftPlayerResponse;
}

export namespace ShiftPlayerResponse {
  export type AsObject = {
    status: ResponseStatusMap[keyof ResponseStatusMap],
    none?: EmptyMessage.AsObject,
    getstatusdata?: GetStatusData.AsObject,
  }

  export enum DataCase {
    DATA_NOT_SET = 0,
    NONE = 2,
    GETSTATUSDATA = 3,
  }
}

export class EmptyMessage extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EmptyMessage.AsObject;
  static toObject(includeInstance: boolean, msg: EmptyMessage): EmptyMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EmptyMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EmptyMessage;
  static deserializeBinaryFromReader(message: EmptyMessage, reader: jspb.BinaryReader): EmptyMessage;
}

export namespace EmptyMessage {
  export type AsObject = {
  }
}

export class GetStatusData extends jspb.Message {
  hasCurrentposition(): boolean;
  clearCurrentposition(): void;
  getCurrentposition(): SequencePosition | undefined;
  setCurrentposition(value?: SequencePosition): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetStatusData.AsObject;
  static toObject(includeInstance: boolean, msg: GetStatusData): GetStatusData.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetStatusData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetStatusData;
  static deserializeBinaryFromReader(message: GetStatusData, reader: jspb.BinaryReader): GetStatusData;
}

export namespace GetStatusData {
  export type AsObject = {
    currentposition?: SequencePosition.AsObject,
  }
}

export class SequencePosition extends jspb.Message {
  getEndtimems(): number;
  setEndtimems(value: number): void;

  getCurrenttimems(): number;
  setCurrenttimems(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SequencePosition.AsObject;
  static toObject(includeInstance: boolean, msg: SequencePosition): SequencePosition.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SequencePosition, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SequencePosition;
  static deserializeBinaryFromReader(message: SequencePosition, reader: jspb.BinaryReader): SequencePosition;
}

export namespace SequencePosition {
  export type AsObject = {
    endtimems: number,
    currenttimems: number,
  }
}

export class SetPlayMode extends jspb.Message {
  getPlaymode(): PlayModeMap[keyof PlayModeMap];
  setPlaymode(value: PlayModeMap[keyof PlayModeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SetPlayMode.AsObject;
  static toObject(includeInstance: boolean, msg: SetPlayMode): SetPlayMode.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SetPlayMode, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SetPlayMode;
  static deserializeBinaryFromReader(message: SetPlayMode, reader: jspb.BinaryReader): SetPlayMode;
}

export namespace SetPlayMode {
  export type AsObject = {
    playmode: PlayModeMap[keyof PlayModeMap],
  }
}

export class SetSequenceMessage extends jspb.Message {
  getSequencelength(): number;
  setSequencelength(value: number): void;

  clearInstrumenteventsList(): void;
  getInstrumenteventsList(): Array<InstrumentEvents>;
  setInstrumenteventsList(value: Array<InstrumentEvents>): void;
  addInstrumentevents(value?: InstrumentEvents, index?: number): InstrumentEvents;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SetSequenceMessage.AsObject;
  static toObject(includeInstance: boolean, msg: SetSequenceMessage): SetSequenceMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SetSequenceMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SetSequenceMessage;
  static deserializeBinaryFromReader(message: SetSequenceMessage, reader: jspb.BinaryReader): SetSequenceMessage;
}

export namespace SetSequenceMessage {
  export type AsObject = {
    sequencelength: number,
    instrumenteventsList: Array<InstrumentEvents.AsObject>,
  }
}

export class InstrumentEvents extends jspb.Message {
  getInstrument(): string;
  setInstrument(value: string): void;

  clearEventsList(): void;
  getEventsList(): Array<SequenceEvent>;
  setEventsList(value: Array<SequenceEvent>): void;
  addEvents(value?: SequenceEvent, index?: number): SequenceEvent;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InstrumentEvents.AsObject;
  static toObject(includeInstance: boolean, msg: InstrumentEvents): InstrumentEvents.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InstrumentEvents, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InstrumentEvents;
  static deserializeBinaryFromReader(message: InstrumentEvents, reader: jspb.BinaryReader): InstrumentEvents;
}

export namespace InstrumentEvents {
  export type AsObject = {
    instrument: string,
    eventsList: Array<SequenceEvent.AsObject>,
  }
}

export class SequenceEvent extends jspb.Message {
  getEventtime(): number;
  setEventtime(value: number): void;

  getDuration(): number;
  setDuration(value: number): void;

  getValuesMap(): jspb.Map<string, EventValue>;
  clearValuesMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SequenceEvent.AsObject;
  static toObject(includeInstance: boolean, msg: SequenceEvent): SequenceEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SequenceEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SequenceEvent;
  static deserializeBinaryFromReader(message: SequenceEvent, reader: jspb.BinaryReader): SequenceEvent;
}

export namespace SequenceEvent {
  export type AsObject = {
    eventtime: number,
    duration: number,
    valuesMap: Array<[string, EventValue.AsObject]>,
  }
}

export class EventValue extends jspb.Message {
  hasNumericvalue(): boolean;
  clearNumericvalue(): void;
  getNumericvalue(): number;
  setNumericvalue(value: number): void;

  hasStringvalue(): boolean;
  clearStringvalue(): void;
  getStringvalue(): string;
  setStringvalue(value: string): void;

  hasRangedvalue(): boolean;
  clearRangedvalue(): void;
  getRangedvalue(): RangedValue | undefined;
  setRangedvalue(value?: RangedValue): void;

  getValueCase(): EventValue.ValueCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EventValue.AsObject;
  static toObject(includeInstance: boolean, msg: EventValue): EventValue.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EventValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EventValue;
  static deserializeBinaryFromReader(message: EventValue, reader: jspb.BinaryReader): EventValue;
}

export namespace EventValue {
  export type AsObject = {
    numericvalue: number,
    stringvalue: string,
    rangedvalue?: RangedValue.AsObject,
  }

  export enum ValueCase {
    VALUE_NOT_SET = 0,
    NUMERICVALUE = 1,
    STRINGVALUE = 2,
    RANGEDVALUE = 3,
  }
}

export class RangedValue extends jspb.Message {
  getStartvalue(): number;
  setStartvalue(value: number): void;

  getEndvalue(): number;
  setEndvalue(value: number): void;

  getCurve(): number;
  setCurve(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RangedValue.AsObject;
  static toObject(includeInstance: boolean, msg: RangedValue): RangedValue.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RangedValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RangedValue;
  static deserializeBinaryFromReader(message: RangedValue, reader: jspb.BinaryReader): RangedValue;
}

export namespace RangedValue {
  export type AsObject = {
    startvalue: number,
    endvalue: number,
    curve: number,
  }
}

export interface ResponseStatusMap {
  OK: 0;
  GENERALERROR: 1;
  PARSINGERROR: 2;
  INVALIDINPUT: 3;
}

export const ResponseStatus: ResponseStatusMap;

export interface PlayModeMap {
  PLAY: 0;
  STOP: 1;
  PAUSE: 2;
}

export const PlayMode: PlayModeMap;

