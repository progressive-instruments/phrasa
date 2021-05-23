import {ISequenceBuilder} from './ISequenceBuilder'
import {Sequence, SequenceEvent, EventValue} from './Sequence'
import {PieceTree, Phrase, ExpressionInput, Expression, Pitch} from './PieceTree.js'
import * as Evaluator from './Evaluator.js'
import * as _ from 'lodash'

interface Context {
  contextLength: number;
  pitch?: Pitch
}

export class SequenceBuilder implements ISequenceBuilder {
  private _relativeBeatLength?: number;
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

  private evalOffset(input: ExpressionInput): number {
    if(typeof input == 'string') {
      return Evaluator.evaluate(input, [
        Evaluator.PrecentToFactor,
        Evaluator.ToFloat]);
    };
    throw new Error('unsupported offset format');
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

  // return endTime
  private evalPhrase(phrase: Phrase, context: Context, totalPhrases: number, phraseStartTime: number, events: SequenceEvent[]): number {
    if(!phrase.phraseLength) {
      context.contextLength /= totalPhrases;
    } else {
      context.contextLength = this.evalLength(context.contextLength, phrase.phraseLength);
    }
    if(phrase.beat) {
      if(this._relativeBeatLength) {
        throw new Error('only one beat definition is allowed');
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
    if(phrase.branches) {
      throw new Error('branches are not supported');
    }
    if(phrase.sequences) {
      throw new Error('sequences are not supported');
    }
    if(phrase.variables) { 
      throw new Error('variables are not supported');
    }
    let phraseEndTime = phraseStartTime + context.contextLength;
    if(phrase.phrases && phrase.phrases.length > 0) {
      phraseEndTime = phraseStartTime;
      let totalPhrases = phrase.totalPhrases ?? phrase.phrases.length;
      for(let i = 0 ; i < totalPhrases ; ++i) {
        phraseEndTime = this.evalPhrase(
          phrase.phrases[i], 
          JSON.parse(JSON.stringify(context)),
          totalPhrases,
          phraseEndTime,
          events);
      }
    }

    if(phrase.sounds) {
      for(const [soundKey,s] of phrase.sounds) {
        for(const [eventIndex,e] of s.events) {

          let values = new Map<string,EventValue>();
          if(e.values) {
            for(const [valueKey,v] of e.values) {
              if(typeof v != 'string') {
                throw new Error('unsupported event value type');
              }
              values.set(valueKey,v);
            }
          }
          if(e.frequency) {
            if(typeof e.frequency.value != 'string') {
              throw new Error('unsupported event value type');
            }
            let frequency: number;
            switch(e.frequency.type) {
              case 'pitch':
                frequency = this.frequencyFromPitch(context.pitch, e.frequency.value);
                break;
                case 'note':
                frequency = Evaluator.evaluate(e.frequency.value, [Evaluator.NoteToFrequency]);
                break;
              case 'frequency':
                frequency = Evaluator.evaluate(e.frequency.value,[Evaluator.ToFloat]);
                break;
            }
            values.set('frequency',frequency);
          }
          const phraseDuration = phraseEndTime - phraseStartTime;
          let startTime = phraseStartTime;
          let endTime = phraseEndTime;
          if(e.startOffset) {
            const factor = this.evalOffset(e.startOffset)
            startTime = startTime + phraseDuration * factor
          }
          if(e.endOffset) {
            const factor = this.evalOffset(e.endOffset)
            endTime = endTime + phraseDuration * factor
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

    return phraseEndTime;
  }
}