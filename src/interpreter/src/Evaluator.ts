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

const noteToValue = {c:0,d:2,e:4,f:5,g:7,a:9,b:11};

export const NoteToFrequency: RegexEvaluator<number> =  {
  expression: /([a-zA-Z])(#*|b*)(-?\d)/,
  evaluate(matches) {
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

function positiveModulo(num: number,mod: number) {
  return ((num%mod)+mod)%mod;
};


function buildGrid(gridBase: readonly number[], key: string, sig?: string): number[] {
  let shift = noteToValue[key.toLowerCase()]
  if(sig == '#') {
    shift++
  } else if(sig =='b') {
    shift--
  }
  const shiftedGrid = gridBase.map(note => positiveModulo(note+shift,12)).sort();
  
  let frequencyGrid: number[] = [];
  for(let i = 0 ; i < 10 ; ++i) {
    frequencyGrid.push(...shiftedGrid.map(note => midiInHertz(note + 12*i)));
  }
  return frequencyGrid;
}

export const ChordToGrid: RegexEvaluator<number[]> =  {
  expression: /^([a-g])(b|#)?-(min|maj)$/i,
  evaluate(matches) {
    const gridBase = matches[3].toLowerCase() == 'maj' ? [0,4,7] : [0,3,7]
    return buildGrid(gridBase, matches[1], matches[2]);

  }
}

export const ScaleToGrid: RegexEvaluator<number[]> =  {
  expression: /^([a-g])(b|#)?-(min|maj)$/i,
  evaluate(matches) {
    const gridBase = matches[3].toLowerCase() == 'maj' ? [0,2,4,5,7,9,11] : [0,2,4,5,7,9,11]
    return buildGrid(gridBase, matches[1], matches[2]);
  }
}

export const ToInteger: RegexEvaluator<number> =  {
  expression: /^-?\d+$/,
  evaluate(matches) {
    return parseInt(matches[0]);
  }
}

export const ToUnsignedInteger: RegexEvaluator<number> =  {
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