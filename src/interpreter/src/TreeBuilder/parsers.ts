import { KeyPrefixes, Property, ExpressionSubject, PhrasaSymbol } from "./symbols.js";
import * as Tree from '../PieceTree.js'
import * as ValueEvaluator from '../Evaluator.js'
import _ from 'lodash'


export interface ExtendedPhrase extends Tree.Phrase {
  defaultInnerPhrase? : Tree.Phrase;
}

const EventsPostifxRegex = /(.+)~([1-9]\d*)?$/;
export function splitAssignKey(path: string) : string[] {
  let res: string[] = [];
  for(let key of path.split('.')) {

      let prefix = key.charAt(0);
      if(KeyPrefixes.has(key.charAt(0))) {
        key = key.slice(1);
        res.push(KeyPrefixes.get(prefix));
      }

      res.push(key);

      let postfixMatch = key.match(EventsPostifxRegex);
      if(postfixMatch) {
        res[res.length-1] = postfixMatch[1];
        if(postfixMatch[2]) {
          res.push(Property.Events)
          res.push(postfixMatch[2]);
        } else {
          res.push(Property.Event);
        }
      }
    }
    return res;
}


export abstract class ExpressionEvaluator {
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {throw new Error(`property ${propertyName} unknown`);}
  getInnerExprEvaulator(evaluatorSubject: string) {
    return this.getInnerAssigner(evaluatorSubject);
  }
  setStringValue(value : string) {
    throw new Error("value assign is not supported");
  }
  setSequenceExpression(sequence: Tree.SequenceTrigger) {
    throw new Error("sequence trigger is not supported");
  }
  assignEnd() {}
}


export class PhraseAssigner extends ExpressionEvaluator {
  constructor(private _phrase: ExtendedPhrase){
    super();
  }
    getInnerAssigner(propertyName: string) : ExpressionEvaluator {
      switch(propertyName) {
        case Property.Pitch:
          if(!this._phrase.pitch) {
            this._phrase.pitch = {};
          }
          return new PitchAssigner(this._phrase.pitch);
        case Property.Tempo:
          return new TempoAssigner(this._phrase);
        case Property.Phrases:
          if(!this._phrase.phrases) {
            this._phrase.phrases = [];
          }
          if(!this._phrase.defaultInnerPhrase) {
            this._phrase.defaultInnerPhrase = {};
          }
          return new PhrasesAssigner(this._phrase);
        case Property.Length:
          return new LengthAssigner(this._phrase);
        case Property.Branches:
          if(!this._phrase.branches) {
            this._phrase.branches = new Map<string, Tree.Phrase>();
          }
          return new BranchesAssigner(this._phrase.branches);
        case Property.Sequences:
          if(!this._phrase.sequences) {
            this._phrase.sequences = new Map<string, Tree.Sequence>();
          }
          return new SequencesAssigner(this._phrase.sequences);
        default:
          if(!this._phrase.sounds) {
            this._phrase.sounds = new Map<string,Tree.Sound>();
          }
          let soundEvents = getOrCreate(this._phrase.sounds, propertyName, ()=> {return {events: new Map<number, Tree.PhraseEvent>()}});
          return new SoundAssigner(soundEvents);
      }
    }
    setStringValue(value : string) {
      if(value == PhrasaSymbol.Beat) {
        this._phrase.beat = true;
      } else {
        super.setStringValue(value);
      }
    }
}

export class SelectorAssigner extends ExpressionEvaluator {
  constructor(
    private _path:string[], 
    private _innerAssigner: ExpressionEvaluator) {
      super();
  }
  getInnerAssigner(property: string): ExpressionEvaluator{
    let assigner = this._innerAssigner.getInnerAssigner(property);
    for(const prop of this._path) {
      assigner = assigner.getInnerAssigner(prop);
    }
    return assigner;
  }
}


class TempoAssigner extends ExpressionEvaluator {
  constructor(private _phrase: ExtendedPhrase){
      super();
    }

    setStringValue(value : string) {
      this._phrase.tempo = value;
    }
}


class ChordEvaluator extends ExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }
  setStringValue(value: string) {
    this._pitch.grid = ValueEvaluator.evaluate(value,[ValueEvaluator.ChordToGrid])
  }
}

class ScaleEvaluator extends ExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }
  setStringValue(value: string) {
    this._pitch.grid = ValueEvaluator.evaluate(value,[ValueEvaluator.ScaleToGrid])
  }
}

class PitchGridAssigner extends ExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }
  getInnerExprEvaulator(assigner: string): ExpressionEvaluator {
    if(assigner == ExpressionSubject.Chord) {
      return new ChordEvaluator(this._pitch);
    } else if(assigner == ExpressionSubject.Scale) {
      return new ScaleEvaluator(this._pitch);
    }
    return super.getInnerAssigner(assigner);
  }

  setStringValue(value: string) {
    this._pitch.grid = ValueEvaluator.evaluate(value,[ValueEvaluator.ScaleToGrid])
  }
}

class PitchZoneAssigner extends ExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }

  setStringValue(value: string) {
    this._pitch.zone = ValueEvaluator.evaluate(value,[ValueEvaluator.NoteToFrequency])
  }
}

class PitchAssigner extends ExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch){
    super();
  }

  getInnerAssigner(property: string) {
    if(property == Property.PitchGrid) {
      return new PitchGridAssigner(this._pitch);
    } else if (property == Property.PitchZone) {
      return new PitchZoneAssigner(this._pitch);
    }
    return super.getInnerAssigner(property);
  }

}



function getOrCreate<T,U>(map: Map<T,U> , key: T, defaultValue: ()=>U): U {
  if(!map.has(key)) {
    map.set(key, defaultValue());
  }
  return map.get(key);
}

class PhrasesLengthAssigner extends ExpressionEvaluator {
  constructor(
    private _parentPhrase: ExtendedPhrase) {
    super();
  }
  setStringValue(value: string) { 
    const num = ValueEvaluator.evaluate(value, [ValueEvaluator.ToUnsignedInteger]);
    for(let i = this._parentPhrase.phrases.length ; i < num ; ++i) {
      this._parentPhrase.phrases.push(_.cloneDeep(this._parentPhrase.defaultInnerPhrase));
    }
    this._parentPhrase.totalPhrases = num;
  }


}

class PhrasesAssigner extends ExpressionEvaluator {
  constructor(
    private _parentPhrase: ExtendedPhrase){
    super();
  }
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {
    if(propertyName == Property.PhrasesTotal){
      return new PhrasesLengthAssigner(this._parentPhrase);
    }
    else if(propertyName == Property.PhrasesEach) {
      let assigners :ExpressionEvaluator[] = 
        [
          new PhraseAssigner(this._parentPhrase.defaultInnerPhrase),
        ];
      if(this._parentPhrase.phrases) {
        assigners.push(...this._parentPhrase.phrases.map(phrase => new PhraseAssigner(phrase)));
      }
      return new MultiExpressionEvaluator(assigners);
    } else {
      const phraseIndexes = ValueEvaluator.evaluate(propertyName,[ValueEvaluator.OneBasedToZeroBaseRanged]);
      let assigners :ExpressionEvaluator[] = []; 
      for(const phraseIndex of phraseIndexes) {
        while(phraseIndex >= this._parentPhrase.phrases.length) {
          this._parentPhrase.phrases.push(_.cloneDeep(this._parentPhrase.defaultInnerPhrase));
        }
        assigners.push(new PhraseAssigner(this._parentPhrase.phrases[phraseIndex]));
      }
      return new MultiExpressionEvaluator(assigners);
    }
    
  }
}

class LengthAssigner extends ExpressionEvaluator {
  constructor(private _phrase: ExtendedPhrase){
    super();
  }
  setStringValue(value : string) {
    this._phrase.phraseLength = value;
  }
}

class MultiExpressionEvaluator extends ExpressionEvaluator {
  constructor(private _assigners: ExpressionEvaluator[]) {
    super();
  }
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {
    return new MultiExpressionEvaluator(this._assigners.map(a => a.getInnerAssigner(propertyName)));
  }
  getInnerExprEvaulator(propertyName: string) : ExpressionEvaluator {
    return new MultiExpressionEvaluator(this._assigners.map(a => a.getInnerExprEvaulator(propertyName)));
  }
  setStringValue(value: string) {
    for(const assigner of this._assigners) {
      assigner.setStringValue(value);
    }
  }
  assignEnd() {
    for(const assigner of this._assigners) {
      assigner.assignEnd();
    }
  }
}

class BranchesAssigner extends ExpressionEvaluator {
  constructor(private _branches: Map<string,ExtendedPhrase>) {
    super();
  }
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {
    
    if(!this._branches.has(propertyName)) {
      this._branches.set(propertyName,{});
    }
    return new PhraseAssigner(this._branches.get(propertyName));
  }
}

class SequencesAssigner extends ExpressionEvaluator {
  constructor(private _sequences: Map<string, Tree.Sequence>){
    super();
  }
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {
    if(!this._sequences.has(propertyName)) {
      this._sequences.set(propertyName,[]);
    }
    return new SequenceAssigner(this._sequences.get(propertyName));
  }
}

class SequenceAssigner extends ExpressionEvaluator {
  constructor(private _sequence: Tree.Sequence){
    super();
    _sequence.length = 0; 
  }
  setStringValue(value: string) {
    this._sequence.push(value);
  }
}

const StepsExpression = /(^>+$)|(^<+$)/
class SequenceTriggerAssigner extends ExpressionEvaluator {
  _name : string;
  _steps : number;
  constructor(private _valueAssigner: EventValueAssigner) {
    super()
    this._steps = 1;
  }
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {
    this._name = propertyName;
    return this;
  }
  getInnerExprEvaulator(propertyName: string) : ExpressionEvaluator {
    throw new Error('name of sequence trigger unspecified')
  }

  setStringValue(propertyName: string) {
    let match = propertyName.match(StepsExpression)
    if(!match) {
      throw new Error('invalid sequence trigger argument');
    }
    this._steps = propertyName.length;
    if(propertyName.startsWith('<')) {
      this._steps *= -1;
    }
  }

  assignEnd() {
    if(this._name == undefined) {
      throw new Error('name of sequence trigger unspecified')
    }
    this._valueAssigner.setSequenceExpression(new Tree.SequenceTrigger (this._name, this._steps))
  }


} 

class EventValueAssigner extends ExpressionEvaluator {
  constructor(
    private _event: Tree.PhraseEvent, 
    private _valueKey : string){
    super();
  }

  getInnerExprEvaulator(property: string): ExpressionEvaluator {
    let keys = splitAssignKey(property);
    if(keys.length == 1 && keys[0] == Property.Sequences) {
      return new SequenceTriggerAssigner(this);
    } else if(keys.length == 2 && keys[0] == Property.Sequences) {
      return new SequenceTriggerAssigner(this).getInnerAssigner(keys[1]);
    }
    return super.getInnerAssigner(property);
  }

  setStringValue(value: string) {
    this.setValue(value);
  }

  setSequenceExpression(sequenceTrigger:Tree.SequenceTrigger ) {
    this.setValue(sequenceTrigger);
  }

  private setValue(value: string | Tree.SequenceTrigger) {
    if(this._valueKey === Property.EventStartOffset) {
      this._event.startOffset = value;
    } else if(this._valueKey === Property.EventEndOffset) {
      this._event.endOffset = value;
    } else if(this._valueKey === PhrasaSymbol.PitchEventValue) {
      this._event.frequency = {type: 'pitch', value: value};
    } else if(this._valueKey === PhrasaSymbol.FrequencyEventValue) {
      this._event.frequency = {type: 'frequency', value: value};
    } else if(this._valueKey === PhrasaSymbol.NoteEventValue) {
      this._event.frequency = {type: 'note', value: value};
    } else {
      this._event.values.set(this._valueKey, value);
    }
  }
}

class EventAssigner extends ExpressionEvaluator {
  constructor(private event: Tree.PhraseEvent){
    super();
  }
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {
    return new EventValueAssigner(this.event, propertyName);
  }
}

class EventsAssigner extends ExpressionEvaluator {
  constructor(private _events: Map<number,Tree.PhraseEvent>){
    super();
  }
  getInnerAssigner(eventNum: string) : ExpressionEvaluator {
    let index = ValueEvaluator.evaluate(eventNum,[ValueEvaluator.OneBasedToZeroBased]);
    if(index == null) { 
      throw new Error('invalid event key');
    }
    if(!this._events.has(index)) {
      this._events.set(index, {values: new Map<string, Tree.EventValue>()});
    }
    return new EventAssigner(this._events.get(index));
  }
}



class SoundAssigner extends ExpressionEvaluator {
  constructor(private _sound: Tree.Sound){
    super();
  }
  getInnerAssigner(input: string) : ExpressionEvaluator {

    if(input == Property.Events) {
      return new EventsAssigner(this._sound.events);
    } else if(input == Property.Event) {
      const firstEvent = getOrCreate(this._sound.events, 0, ()=>{return {values: new Map<string, Tree.EventValue>()};});
      return new EventAssigner(firstEvent);
    } else {
      throw new Error('unknown instrument property');
    }
  }
}
