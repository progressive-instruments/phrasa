import {TextLocation} from './PieceTree'

export function evaluate<T>(input: string & TextLocation, evaluators: RegexEvaluator<T>[]): T {
  for(const evaluator of evaluators) {
    const match = input.match(evaluator.expression);
      if(match) {
        let res =  evaluator.evaluate(match);
        if(res != null && res != undefined) {
          return res;
        }
      }
  }
  throw new Error(`unable to parse string '${input}'`);
}

interface RegexEvaluator<T> {
  expression: RegExp;
  evaluate(matchArr: RegExpMatchArray):T;
}

export const BpmToMs: RegexEvaluator<number> =  {
  expression: /^(\d*[.]?\d+)bpm$/,
  evaluate(matches) {
    return 60000 / parseFloat(matches[1]);
  }
}

export const ToFloat: RegexEvaluator<number> =  {
  expression: /^-?\d*[.]?\d+$/,
  evaluate(matches) {
    return parseFloat(matches[0]);
  }
}


export const PrecentToFactor: RegexEvaluator<number> =  {
  expression: /^(-?\d*[.]?\d+)%$/,
  evaluate(matches) {
    return parseFloat(matches[1])/100.0;
  }
}

function midiInHertz (noteNumber: number) {
  return 440 * Math.pow(2.0, (noteNumber - 69) / 12.0);
}

export const NoteToFrequency: RegexEvaluator<number> =  {
  expression: /([a-zA-Z])(#*|b*)(-?\d)/,
  evaluate(matches) {
    const noteToValue = {c:0,d:2,e:4,f:5,g:7,a:9,b:11};
    let res : number;
    res = noteToValue[matches[1].toLowerCase()]

    if(matches[2].startsWith('#')) {
      res = res + matches[2].length;
    } else if(matches[2].startsWith('b')) {
      res = res - matches[2].length;
    }

    res = res + 12*(parseInt(matches[3]) + 1);
    res = midiInHertz(res)
    return res;
  }
}

export const ToInteger: RegexEvaluator<number> =  {
  expression: /^\d+$/,
  evaluate(matches) {
    return parseInt(matches[0]);
  }
}

export const OneBasedToZeroBased: RegexEvaluator<number> =  {
  expression: /^[1-9]\d*$/,
  evaluate(matches) {
    return parseInt(matches[0])-1;
  }
}

export const OneBasedToZeroBasedWithRange: RegexEvaluator<[number,number]> =  {
  expression: /^([1-9]\d*)(?:-([1-9]\d*$))?$/,
  evaluate(matches) {
    let bottom = parseInt(matches[1])-1;
    let upper = matches[2] ?parseInt(matches[2])-1  : bottom;
    if(bottom > upper) { 
      return null;
    } else {
      return [bottom,upper];
    }
  }
}
