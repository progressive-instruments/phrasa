import {ISequenceBuilder} from './ISequenceBuilder'
import {Sequence, SequenceEvent, EventValue} from './Sequence'
import {PieceTree, Phrase, ExpressionInput, Expression} from './PieceTree'

interface Context {
  length: number;
}



interface ExpressionEvaluator<T> {
  expression: RegExp;
  evaluate(matchArr: RegExpMatchArray):T;
}

const BpmToMsEvaluator: ExpressionEvaluator<number> =  {
  expression: /^(\d*[.]?\d+)bpm$/,
  evaluate(matches) {
    return 60000 / parseFloat(matches[1]);
  }
}

const FloatEvaluator: ExpressionEvaluator<number> =  {
  expression: /^-?\d*[.]?\d+$/,
  evaluate(matches) {
    return parseFloat(matches[0]);
  }
}


const PrecentToFactorEvaluator: ExpressionEvaluator<number> =  {
  expression: /^(-?\d*[.]?\d+)%$/,
  evaluate(matches) {
    return parseFloat(matches[1])/100.0;
  }
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
  private evaluate<T>(input: string, evaluators: ExpressionEvaluator<T>[]): T {
    for(const evaluator of evaluators) {
      const match = input.match(evaluator.expression);
        if(match) {
          return evaluator.evaluate(match);
        }
    }
    throw new Error(`unable to parse string '${input}'`);
  }

  private evalTempo(input: ExpressionInput): number {
    if(typeof input == 'string') {
      return this.evaluate(input, [BpmToMsEvaluator]);
    }
    throw new Error('unsupported offset format');
  }

  private evalOffset(input: ExpressionInput): number {
    if(typeof input == 'string') {
      return this.evaluate(input, [
        PrecentToFactorEvaluator,
        FloatEvaluator]);
    };
    throw new Error('unsupported offset format');
  }
  // return endTime
  private evalPhrase(phrase: Phrase, context: Context, totalPhrases: number, phraseStartTime: number, events: SequenceEvent[]): number {
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
    let phraseEndTime = phraseStartTime + context.length;
    if(phrase.phrases && phrase.phrases.length > 0) {
      phraseEndTime = phraseStartTime;
      phrase.phrases.forEach(ph => {
        phraseEndTime = this.evalPhrase(
          ph, 
          JSON.parse(JSON.stringify(context)),
          phrase.phrases.length,
          phraseEndTime,
          events);
      })
    }

    if(phrase.sounds) {
      for(const [k,s] of phrase.sounds) {
        for(const [eventIndex,e] of s) {
          let values = new Map<string,EventValue>();
          e.values.forEach((v,k) => {
            if(typeof v != 'string') {
              throw new Error('not supported event value type');
            }
            values.set(k,v);
          });
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