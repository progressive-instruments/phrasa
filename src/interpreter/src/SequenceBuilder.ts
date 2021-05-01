import {ISequenceBuilder} from './ISequenceBuilder'
import {Sequence, SequenceEvent, EventValue} from './Sequence'
import {PieceTree, Phrase, ExpressionInput} from './PieceTree'

interface Context {
  length: number;
}

export class SequenceBuilder implements ISequenceBuilder {
  private _relativeBeatLength?: number;
  build(tree: PieceTree) : Sequence {
    if(!tree.rootPhrase.tempo) {
      throw new Error('tempo must be specified in root phrase');
    }
    let betLength = this.evalTempo(tree.rootPhrase.tempo);
    let events: SequenceEvent[] = [];
    let endTime = this.evalPhrase(tree.rootPhrase, {length: 1},1, 0, events);
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
    const _bpmExpr = /^(\d*[.]?\d)+bpm$/
    if(typeof input == 'string') {
        let match = input.match(_bpmExpr);
        if(match) {
          return 60000 / parseFloat(match[1]);
        }
    }
    throw new Error('unsupported length format');
  }


  // return endTime
  private evalPhrase(phrase: Phrase, context: Context, totalPhrases: number, startTime: number, events: SequenceEvent[]): number {
    if(!phrase.length) {
      context.length /= totalPhrases;
    } else {
      context.length = this.evalLength(context.length, phrase.length);
    }
    if(phrase.beat) {
      if(this._relativeBeatLength) {
        throw new Error('only one beat definition is allowed');
      }
      this._relativeBeatLength = context.length;
    }
    if(phrase.pitch) {
      throw new Error('pitch is not supported');
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
    let endTime: number;
    if(phrase.phrases && phrase.phrases.length > 0) {
      endTime = startTime;
      phrase.phrases.forEach(ph => {
        endTime = this.evalPhrase(
          ph, 
          JSON.parse(JSON.stringify(context)),
          phrase.phrases.length,
          endTime,
          events);
      })
    }else {
      endTime = startTime + context.length;
    }

    if(phrase.events) {
      phrase.events.forEach((e,k) => {
        let values = new Map<string,EventValue>();
        e.forEach((v,k) => {
          if(typeof v != 'string') {
            throw new Error('not supported event value type');
          }
          values.set(k,v);
        });
        events.push({
          startTimeMs: startTime,
          durationMs: endTime - startTime,
          values: values
        });
      })
    }

    return endTime;
  }
}