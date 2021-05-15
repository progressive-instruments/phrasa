import {InputStream, Token, CommonTokenStream, Recognizer} from 'antlr4'
import PhrasaLexer from "./generated-parser/PhrasaLexer.js"
import PhrasaParser from "./generated-parser/PhrasaParser.js"
import Listener from "./generated-parser/PhrasaListener.js"

import {ITreeBuilder} from './ITreeBuilder'
import * as Tree from './PieceTree'
import {TextContent} from './TextContent'
import { ParseTreeWalker } from 'antlr4/src/antlr4/tree/Tree.js'
import { TerminalNode } from 'antlr4/tree/Tree'
import { ErrorStrategy } from 'antlr4/error/ErrorStrategy'

import * as ValueEvaluator from './Evaluator.js'

interface ExtendedPhrase extends Tree.Phrase {
  defaultInnerPhrase? : Tree.Phrase;
}

interface ExtendedTree extends Tree.PieceTree {
  rootPhrase :ExtendedPhrase
}

class GetNotesErrorRecognizer {
  syntaxError(recognizer: Recognizer, offendingSymbol: Token, line: number, column: number, msg: string, e: any): void {
      console.error(`lexer/parser error line: ${line} column: ${column} msg: ${msg}`)
      throw new Error('lexer/parser error');
  }
}

abstract class ExpressionEvaluator {
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {throw new Error(`property ${propertyName} unknown`);}
  getInnerExprEvaulator(evaluatorSubject: string) {
    return this.getInnerAssigner(evaluatorSubject);
  }
  setValue(value : string) {
    throw new Error("value assign is not supported");
  }
}

class TempoAssigner extends ExpressionEvaluator {
  constructor(private _phrase: ExtendedPhrase){
      super();
    }

    setValue(value : string) {
      this._phrase.tempo = value;
    }

}

enum PhrasaSymbol { 
  Beat = "beat",
  PitchEventValue = "pitch",
  FrequencyEventValue = "frequency",
  NoteEventValue = "note",
  SelectorSymbol = "#",
}

enum Property {
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
  PitchZone = 'zone'
}

const KeyPrefixes:Map<string,Property> = new Map<string,Property>([
  ['>', Property.Phrases],
  ['$', Property.Sequences],
  ['&', Property.Branches]
])



class SelectorAssigner extends ExpressionEvaluator {
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

enum ExpressionSubject {
  Chord = 'chord',
  Scale = 'scale'
}

class ChordEvaluator extends ExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }
  setValue(value: string) {
    this._pitch.grid = ValueEvaluator.evaluate(value,[ValueEvaluator.ChordToGrid])
  }
}

class ScaleEvaluator extends ExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }
  setValue(value: string) {
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

  setValue(value: string) {
    this._pitch.grid = ValueEvaluator.evaluate(value,[ValueEvaluator.ScaleToGrid])
  }
}

class PitchZoneAssigner extends ExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }

  setValue(value: string) {
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
  setValue(value: string) { 
    const num = ValueEvaluator.evaluate(value, [ValueEvaluator.ToUnsignedInteger]);
    for(let i = this._parentPhrase.phrases.length ; i < num ; ++i) {
      this._parentPhrase.phrases.push(JSON.parse(JSON.stringify(this._parentPhrase.defaultInnerPhrase)));
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
    } else {
      let range = ValueEvaluator.evaluate(propertyName,[ValueEvaluator.OneBasedToZeroBasedWithRange]);
  
      while(range[1] >= this._parentPhrase.phrases.length) {
        this._parentPhrase.phrases.push(JSON.parse(JSON.stringify(this._parentPhrase.phrases)));
      }
      let assigners :ExpressionEvaluator[] = []; 
      for(let i = range[0] ; i <= range[1] ; ++i) {
        assigners.push(new PhraseAssigner(this._parentPhrase.phrases[i]));
      }
      return new MultiExpressionEvaluator(assigners);
    }
    
  }
}

class LengthAssigner extends ExpressionEvaluator {
  constructor(private _phrase: ExtendedPhrase){
    super();
  }
  setValue(value : string) {
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
  setValue(value: string) {
    for(const assigner of this._assigners) {
      assigner.setValue(value);
    }
  }
}

class BranchesAssigner extends ExpressionEvaluator {
  constructor(private _branches: Map<string,ExtendedPhrase>) {
    super();
  }
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {
    if(!this._branches.has(propertyName)) {
      this._branches[propertyName] = {};
    }
    return new PhraseAssigner(this._branches[propertyName]);
  }
}

class SequencesAssigner extends ExpressionEvaluator {
  constructor(private _sequences: Map<string, Tree.Sequence>){
    super();
  }
}


class EventValueAssigner extends ExpressionEvaluator {
  constructor(
    private _event: Tree.PhraseEvent, 
    private _valueKey : string){
    super();
  }
  setValue(value: string) {
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
      this._events.set(index, {values: new Map<string, Tree.ExpressionInput>()});
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
      const firstEvent = getOrCreate(this._sound.events, 0, ()=>{return {values: new Map<string, Tree.ExpressionInput>()};});
      return new EventAssigner(firstEvent);
    } else {
      throw new Error('unknown instrument property');
    }
  }
}

class PhraseAssigner extends ExpressionEvaluator {
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
            this._phrase.sequences = new Map<string, Tree.ExpressionInput>();
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
    setValue(value : string) {
      if(value == PhrasaSymbol.Beat) {
        this._phrase.beat = true;
      } else {
        super.setValue(value);
      }
    }
}

const EventsPostifxRegex = /(.+)~([1-9]\d*)?$/;

export class TreeBuilder extends Listener implements ITreeBuilder {
  private _tree: Tree.PieceTree;
  private _exprEvaluatorsStack: ExpressionEvaluator[];


  build(piece: TextContent, motifs: TextContent[], instruments: TextContent[]) : Tree.PieceTree {
    this._tree = {rootPhrase: {}};
    this._exprEvaluatorsStack = [new PhraseAssigner(this._tree.rootPhrase)];
    const chars = new InputStream(piece.readAll());
    let lexer = new PhrasaLexer(chars);
    const stream = new CommonTokenStream(lexer);
    const parser = new PhrasaParser(stream);
    let main = parser.main();
    let walker = new ParseTreeWalker();
    walker.walk(this,main);

    return this._tree;
  }
  splitAssignKey(path: string) : string[] {
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

  enterKey(ctx: PhrasaParser.KeyContext) {
      let key = ctx.TEXT();
      let newEvaluator = this._exprEvaluatorsStack[this._exprEvaluatorsStack.length-1];
      let text = ctx.TEXT().getText();
      const path = this.splitAssignKey(text);
      for(let i=0 ; i<path.length; ++i ){
        if(path[i] == PhrasaSymbol.SelectorSymbol) {
          newEvaluator = new SelectorAssigner(path.slice(i+1),newEvaluator);
          break;
        }
        newEvaluator = newEvaluator.getInnerExprEvaulator(path[i])
      }
      this._exprEvaluatorsStack.push(newEvaluator);
  }

  enterValue(ctx: PhrasaParser.ValueContext) {
    let assigner = this._exprEvaluatorsStack[this._exprEvaluatorsStack.length-1];
    if(ctx.TEXT()) {
      let text = ctx.TEXT().getText();
      assigner.setValue(text);
    } else{
      let op = ctx.operation();
      assigner.setValue(op.TEXT(0).getText() + op.OPERATOR().getText() + op.TEXT(1).getText());
    }
  }

  exitNewline_expr(ctx: PhrasaParser.Newline_exprContext) {
    this._exprEvaluatorsStack.pop();
  }
  exitInline_expr(ctx: PhrasaParser.Newline_exprContext) {
    this._exprEvaluatorsStack.pop();
  }

}