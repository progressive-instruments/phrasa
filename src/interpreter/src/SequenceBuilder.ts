import {ISequenceBuilder} from './ISequenceBuilder'
import {Sequence, SequenceEvent, EventValue} from './Sequence'
import {PieceTree, Phrase, ExpressionInput, Expression, Pitch, Sequence as TreeSequence, SequenceTrigger, Sound, OffsetValue} from './PieceTree.js'
import * as Evaluator from './Evaluator.js'
import _ from 'lodash'


interface Context {
  contextLength: number;
  pitch?: Pitch
  sequences?: Map<string,TreeSequence>
}

class TreeSequenceState {
  private indexes: Map<string,number>;
  constructor() {
    this.indexes = new Map<string,number>();
  }
  getNext(name: string, sequence: string[], steps: number): string {
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

  constructor() {
    this._sequenceState = new TreeSequenceState();
  }

  fetchEventValue(value: string | SequenceTrigger, context: Context): string {
    if(value instanceof SequenceTrigger) {
      if(!context.sequences || !context.sequences.has(value.name)) {
        throw new Error(`sequence ${value.name} does not exists in context`);
      }
      return this._sequenceState.getNext(value.name, context.sequences.get(value.name), value.steps)
    }
    return value
  }
 
  build(tree: PieceTree) : Sequence {
    if(!tree.rootPhrase.tempo) {
      throw new Error('tempo must be specified in root phrase');
    }
    let betLength = this.evalTempo(tree.rootPhrase.tempo);
    let events: SequenceEvent[] = [];
    let endTime = this.evalPhrase(tree.rootPhrase, {contextLength: 1},1, 0, events);
    if(!this._relativeBeatLength) {
      throw new Error('beat length must is not defined');
    }
    let tempoFactor = betLength/this._relativeBeatLength;
    events.forEach((e) => {
      e.startTimeMs = e.startTimeMs * tempoFactor
      e.durationMs = e.durationMs * tempoFactor
    })
    endTime =  endTime*tempoFactor;
    return {
      events: events,
      endTime: endTime
    };
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
    let closest = this.getClosestValuesIndex(pitchContext.grid, pitchContext.zone);
    let index = closest[0] + pitchOffset;
    if(index < 0 || index >= pitchContext.grid.length) {
      throw new Error('pitch offset out of range');
    }

    return pitchContext.grid[index];
  }

  private buildEvents(sounds: Map<string,Sound>, context: Context, phraseStartTime: number, phraseEndTime: number, events: SequenceEvent[]) {
    for(const [soundKey,s] of sounds) {
      for(const [eventIndex,e] of s.events) {

        let values = new Map<string,EventValue>();
        if(e.values) {
          for(const [valueKey,v] of e.values) {
            let fetchedValue = this.fetchEventValue(v, context);
            let outValue: number|string;
            try {
              outValue = Evaluator.evaluate(fetchedValue, [Evaluator.ToFloat])
            } catch {
              outValue = fetchedValue;
            }
            values.set(valueKey,outValue);
          }
        }
        if(e.frequency) {
          let fetchedValue = this.fetchEventValue(e.frequency.value, context);
          let frequency: number;
          switch(e.frequency.type) {
            case 'pitch':
              frequency = this.frequencyFromPitch(context.pitch, fetchedValue);
              break;
              case 'note':
              frequency = Evaluator.evaluate(fetchedValue, [Evaluator.NoteToFrequency]);
              break;
            case 'frequency':
              frequency = Evaluator.evaluate(fetchedValue,[Evaluator.ToFloat]);
              break;
          }
          values.set('frequency',frequency);
        }
        const phraseDuration = phraseEndTime - phraseStartTime;
        let startTime = phraseStartTime;
        let endTime: number;
        if(e.startOffset) {
          const factor = this.evalOffset(e.startOffset, context)
          startTime = startTime + phraseDuration * factor
        }
        if(e.endOffset) {
          const factor = this.evalOffset(e.endOffset, context)
          endTime = phraseStartTime + phraseDuration * factor
        } else {
          // compensation for surgee!!!
          endTime = phraseEndTime - 0.0001
        }
        events.push({
          instrument: soundKey,
          startTimeMs: startTime,
          durationMs: endTime - startTime,
          values: values
        });
      }
    }
  }

  // return endTime
  private evalPhrase(phrase: Phrase, context: Context, totalPhrases: number, phraseStartTime: number, events: SequenceEvent[]): number {
    if(!phrase.phraseLength) {
      context.contextLength /= totalPhrases;
    } else {
      context.contextLength = this.evalLength(context.contextLength, phrase.phraseLength);
    }
    if(phrase.beat) {
      if(this._relativeBeatLength) {
        if(Math.abs(context.contextLength - this._relativeBeatLength) > 0.000000001) {
          throw new Error('multiple beats with different lengths were defined');
        }
      }
      this._relativeBeatLength = context.contextLength;
    }
    if(phrase.pitch) {
      if(!context.pitch) {
        context.pitch = new Pitch();
      }
      if(phrase.pitch.zone) {
        context.pitch.zone = phrase.pitch.zone;
      }
      if(phrase.pitch.grid) {
        context.pitch.grid = phrase.pitch.grid
      }
      
    }
    if(phrase.sequences) {
      if(!context.sequences){
        context.sequences = phrase.sequences
      } else {
        context.sequences = new Map([...context.sequences,...phrase.sequences]);
      }
    }
    if(phrase.variables) { 
      throw new Error('variables are not supported');
    }
    if(phrase.branches) {
      for(let branch of phrase.branches) {
        this.evalPhrase(
          branch[1],
          _.cloneDeep(context),
          phraseStartTime,
          1,
          events)
      }

    }

    let phraseEndTime: number;
    if(phrase.phrases && phrase.phrases.length > 0) {
      phraseEndTime = phraseStartTime;
      let totalPhrases = phrase.totalPhrases ?? phrase.phrases.length;
      for(let i = 0 ; i < totalPhrases ; ++i) {
        phraseEndTime = this.evalPhrase(
          phrase.phrases[i],
          _.cloneDeep(context),
          totalPhrases,
          phraseEndTime,
          events);
      }
    } else {
      phraseEndTime = phraseStartTime + context.contextLength
    }

    if(phrase.sounds) {
      this.buildEvents(phrase.sounds, context, phraseStartTime, phraseEndTime, events);
    }

    return phraseEndTime;
  }
}