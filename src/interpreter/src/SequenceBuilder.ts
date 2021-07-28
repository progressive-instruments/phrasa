import {ISequenceBuilder, SequenceBuilderResult} from './ISequenceBuilder'
import {Sequence, SequenceEvent, EventValue, GridNode, Grid} from './Sequence'
import {PieceTree, Section, ExpressionInput, Expression, Pitch, Sequence as TreeSequence, SequenceTrigger, OffsetValue, SectionEvent, EventValue as TreeEventValue, ValueWithErrorPosition, FrequencyExpression} from './PieceTree.js'
import * as Evaluator from './Evaluator.js'
import _ from 'lodash'
import { PhrasaError, TextPosition, ErrorPosition } from './PhrasaError'


interface Context {
  contextLength: number;
  pitch?: Pitch;
  sequences?: Map<string,TreeSequence>;
  defaultInstrument?: string;
}

class TreeSequenceState {
  private indexes: Map<string,number>;
  constructor() {
    this.indexes = new Map<string,number>();
  }
  getNext(name: string, sequence: TreeSequence, steps: number): ValueWithErrorPosition<string> {
    let index = 0;
    if(this.indexes.has(name)){
      index = this.indexes.get(name);
      index = Math.min(index,sequence.length-1);
      index = (index + 1) % sequence.length;
    }
    this.indexes.set(name,index);
    return sequence[index];
  }
}

export class SequenceBuilder implements ISequenceBuilder {
  private _sequenceState: TreeSequenceState;
  private _relativeBeatLength?: number;
  private _errors: PhrasaError[];

  constructor() {
    this._sequenceState = new TreeSequenceState();
  }

  fetchEventValue(value: string | SequenceTrigger, context: Context): string {
    if(value instanceof SequenceTrigger) {
      if(!context.sequences || !context.sequences.has(value.name)) {
        throw new Error(`sequence ${value.name} does not exists in context`);
      }
      return this._sequenceState.getNext(value.name, context.sequences.get(value.name), value.steps).value;
    }
    return value;
  }
 
  tryEval<T>(expression: ()=>T, textPosition: ErrorPosition, shouldContinue:boolean = false) {
    try {
      return expression();
    } catch (inputErr) {
      const err: Error = inputErr;
      this._errors.push({description: err.message, errorPosition: textPosition});
      if(!shouldContinue) {
        throw inputErr;
      }
    }
  }

  build(tree: PieceTree) : SequenceBuilderResult {
    try {
      this._errors = [];
      return this.doBuild(tree);
    } catch(e) {
      if(this._errors.length == 0) {
        throw new Error(`unexpected error - ${e}`)
      }
      return {
        errors: this._errors,
        sequence: null
      };
    }
  }

  private doBuild(tree: PieceTree) : SequenceBuilderResult {
    this.tryEval(() => {
      if(!tree.rootSection.tempo) {
        throw new Error('tempo must be specified in root section');
      }
    }, null);

    let betLength = this.tryEval(() => {
      return this.evalTempo(tree.rootSection.tempo.value);
    }, tree.rootSection?.tempo.errorPosition);
    
    let events: SequenceEvent[] = [];

    let gridRootNode = this.evalSection(tree.rootSection, {contextLength: 1},1, 0, events);
    this.tryEval(() => {
      if(!this._relativeBeatLength) {
        throw new Error('beat length must is not defined');
      }
    }, null);

    let tempoFactor = betLength/this._relativeBeatLength;
    events.forEach((e) => {
      e.startTimeMs = e.startTimeMs * tempoFactor
      e.durationMs = e.durationMs * tempoFactor
    })
    this.factorGridNodeTime(gridRootNode, tempoFactor)
    return {
      sequence: {
        events: events,
        endTime: gridRootNode.endTimeMs,
        grid: {
          rootNode: gridRootNode
        }
      },
      errors: this._errors
    };
  }

  factorGridNodeTime(node:GridNode, tempoFactor: number) {
    node.endTimeMs = node.endTimeMs *tempoFactor;
    node.startTimeMs = node.startTimeMs * tempoFactor;
    for(const innerNode of node.nodes) {
      this.factorGridNodeTime(innerNode,tempoFactor);
    }
  }

  // use generic evaluator
  //const _divisonExpr = /\d+\s*\/\s*\d+/
  private evalLength(baseLength: number, inputLength: ExpressionInput): number {
    if(typeof inputLength == 'string') {
        let res = eval(inputLength)
        return parseFloat(res) * baseLength;
    }
    throw new Error('unsupported length format');
  }

  private evalTempo(input: ExpressionInput): number {
    if(typeof input == 'string') {
      return Evaluator.evaluate(input, [Evaluator.BpmToMs]);
    }
    throw new Error('unsupported offset format');
  }

  private evalOffset(input: OffsetValue, context: Context): number {
    let fetchedValue = this.fetchEventValue(input,context)
    return Evaluator.evaluate(fetchedValue, [
      Evaluator.PrecentToFactor,
      Evaluator.ToFloat]);
  }

  private getClosestValuesIndex(array: number[], value: number): [number,number] {
    let lo = -1, hi = array.length;
    while (hi - lo > 1) {
        var mid = Math.round((lo + hi)/2);
        if (array[mid] <= value) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    if (array[lo] == value) hi = lo;
    return [lo, hi];
  }

  private frequencyFromPitch(pitchContext: Pitch, value: string): number {
    let pitchOffset = Evaluator.evaluate(value, [Evaluator.ToInteger]);
    
    if(pitchContext.zone == null || pitchContext.grid == null) {
      throw new Error('no pitch context defined');
    }
    let closest = this.getClosestValuesIndex(pitchContext.grid.value, pitchContext.zone.value);
    let index = closest[0] + pitchOffset;
    if(index < 0 || index >= pitchContext.grid.value.length) {
      throw new Error('pitch offset out of range');
    }

    return pitchContext.grid.value[index];
  }

  private mapEventValues(inValues: Map<string,ValueWithErrorPosition<TreeEventValue>>, context: Context): Map<string,EventValue> {
    let values = new Map<string,EventValue>();
    for(const [valueKey,v] of inValues) {
      const fetchedValue = this.tryEval(() => {
        return this.fetchEventValue(v.value, context);
      }, v.errorPosition)
      let outValue: number|string;
      try {
        outValue = Evaluator.evaluate(fetchedValue, [Evaluator.ToFloat])
      } catch {
        outValue = fetchedValue;
      }
      values.set(valueKey,outValue);
    }
    return values;
  }

  private parseFrequencyValue(freqExpression: FrequencyExpression, context: Context): number {
    let fetchedValue = this.fetchEventValue(freqExpression.value, context);
    switch(freqExpression.type) {
      case 'pitch':
        return this.frequencyFromPitch(context.pitch, fetchedValue);
        case 'note':
        return Evaluator.evaluate(fetchedValue, [Evaluator.NoteToFrequency]);
      case 'frequency':
        return Evaluator.evaluate(fetchedValue,[Evaluator.ToFloat]);
    }
  }

  private buildEvents(events: Map<number,SectionEvent>, context: Context, sectionStartTime: number, sectionEndTime: number, outEvents: SequenceEvent[]) {
    for(const [eventIndex,e] of events) {
      let values = new Map<string,EventValue>();
      if(e.values) {
        values = this.mapEventValues(e.values,context);
      }
      if(e.frequency) {
        const freqVal = this.tryEval(() => {
          return this.parseFrequencyValue(e.frequency.value, context);
        }, e.frequency.errorPosition) 
        
        values.set('frequency',freqVal);
      }
      const sectionDuration = sectionEndTime - sectionStartTime;
      let startTime = sectionStartTime;
      let endTime: number;
      if(e.startOffset) {
        const factor = this.tryEval(() => {
          return this.evalOffset(e.startOffset.value, context)
        },e.startOffset.errorPosition);
        startTime = startTime + sectionDuration * factor;
      }
      if(e.endOffset) {
        const factor = this.tryEval(() => {
          return this.evalOffset(e.endOffset.value, context);
        }, e.endOffset.errorPosition);
        endTime = sectionStartTime + sectionDuration * factor
      } else {
        // compensation for surgee!!!
        endTime = sectionEndTime - 0.0001
      }
      let instrument = e.instrument?.value ?? context.defaultInstrument;
      this.tryEval(() => {
        if(!instrument) {
          throw new Error(`no instrument defined for event`);
        }
      }, null);
      
      outEvents.push({
        instrument: instrument,
        startTimeMs: startTime,
        durationMs: endTime - startTime,
        values: values
      });
    }
  }

  // return endTime
  private evalSection(section: Section, context: Context, totalSections: number, sectionStartTime: number, outEvents: SequenceEvent[]): GridNode {
    let resNode: GridNode = {
      startTimeMs: sectionStartTime,
      endTimeMs: 0,
      nodes: []
    };

    if(!section.sectionLength) {
      context.contextLength /= totalSections;
    } else {
      context.contextLength = this.tryEval(() => {
        return this.evalLength(context.contextLength, section.sectionLength.value);
      }, section.sectionLength.errorPosition, true); 
    }
    if(section.beat) {
      if(this._relativeBeatLength) {
        this.tryEval(() => {
          if(Math.abs(context.contextLength - this._relativeBeatLength) > 0.000000001) {
            throw new Error('multiple beats with different lengths were defined');
          }
        },section.beat.errorPosition);
      }
      this._relativeBeatLength = context.contextLength;
    }
    if(section.pitch) {
      if(!context.pitch) {
        context.pitch = new Pitch();
      }
      if(section.pitch.zone) {
        context.pitch.zone = section.pitch.zone;
      }
      if(section.pitch.grid) {
        context.pitch.grid = section.pitch.grid
      }
      
    }
    if(section.sequences) {
      if(!context.sequences){
        context.sequences = section.sequences
      } else {
        context.sequences = new Map([...context.sequences,...section.sequences]);
      }
    }
    if(section.defaultInstrument) {
      context.defaultInstrument = section.defaultInstrument.value;
    }
    if(section.variables) { 
      throw new Error('variables are not supported');
    }
    if(section.branches) {
      for(let branch of section.branches) {
        this.evalSection(
          branch[1],
          _.cloneDeep(context),
          1,
          sectionStartTime,
          outEvents)
      }

    }

    if(section.sections && section.sections.length > 0) {
      resNode.endTimeMs = sectionStartTime;
      let totalSections = section.totalSections?.value ?? section.sections.length;
      for(let i = 0 ; i < totalSections ; ++i) {
        const newNode = this.evalSection(
          section.sections[i],
          _.cloneDeep(context),
          totalSections,
          resNode.endTimeMs,
          outEvents);
        resNode.nodes.push(newNode);
        resNode.endTimeMs = newNode.endTimeMs;
      }
    } else {
      resNode.endTimeMs = sectionStartTime + context.contextLength
    }

    if(section.events) {
      this.buildEvents(section.events, context, sectionStartTime, resNode.endTimeMs, outEvents);
    }

    return resNode;
  }
}