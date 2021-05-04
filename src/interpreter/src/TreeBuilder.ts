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

abstract class Assigner {
  getInnerAssigner(propertyName: string) : Assigner {throw new Error(`property ${propertyName} unknown`);}
  assign(value : string) {
    throw new Error("value assign is not supported")
  }
}

class TempoAssigner extends Assigner {
  constructor(private _phrase: ExtendedPhrase){
      super();
    }

    assign(value : string) {
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
}

const KeyPrefixes:Map<string,Property> = new Map<string,Property>([
  ['>', Property.Phrases],
  ['$', Property.Sequences],
  ['&', Property.Branches]
])



class SelectorAssigner extends Assigner {
  constructor(
    private _path:string[], 
    private _innerAssigner: Assigner) {
      super();
  }
  getInnerAssigner(property: string): Assigner{
    let assigner = this._innerAssigner.getInnerAssigner(property);
    for(const prop of this._path) {
      assigner = assigner.getInnerAssigner(prop);
    }
    return assigner;
  }
}

class PitchAssigner extends Assigner {
  constructor(private _phrase: ExtendedPhrase){
    super();
  }
}
function fromOneBasedInteger(input: string): number {
  if(input.match(/^[1-9]\d*$/)) 
  {
    return parseInt(input)-1;
  }
  return null;
}

function fromOneBasedIntegerRange(input: string): [number,number] {
  const match = input.match(/^([1-9]\d*)-([1-9]\d*$)/);
  if(match) 
  {
    let range: [number,number] = [parseInt(match[1])-1,parseInt(match[2])-1];
    if(range[0] > range[1]) { 
      return null;
    } else {
      return range;
    }
  }
  return null;
}


function getOrCreate<T,U>(map: Map<T,U> , key: T, defaultValue: ()=>U): U {
  if(!map.has(key)) {
    map.set(key, defaultValue());
  }
  return map.get(key);
}


class PhrasesAssigner extends Assigner {
  constructor(
    private _phrases: ExtendedPhrase[], 
    private _defaultPhrase: Tree.Phrase){
    super();
  }
  getInnerAssigner(propertyName: string) : Assigner {
    let range : [number,number];
    let index = fromOneBasedInteger(propertyName);
    if(index != null) {
      range = [index,index];
    } else {
      range = fromOneBasedIntegerRange(propertyName);
      if(range == null) {
        return super.getInnerAssigner(propertyName);
      }
    }

    while(range[1] >= this._phrases.length) {
      this._phrases.push(JSON.parse(JSON.stringify(this._defaultPhrase)));
    }
    let assigners :Assigner[] = []; 
    for(let i = range[0] ; i <= range[1] ; ++i) {
      assigners.push(new PhraseAssigner(this._phrases[i]));
    }
    return new MultiAssigner(assigners);
  }
}

class LengthAssigner extends Assigner {
  constructor(private _phrase: ExtendedPhrase){
    super();
  }
  assign(value : string) {
    this._phrase.length = value;
  }
}

class MultiAssigner extends Assigner {
  constructor(private _assigners: Assigner[]) {
    super();
  }
  getInnerAssigner(propertyName: string) : Assigner {
    return new MultiAssigner(this._assigners.map(a => a.getInnerAssigner(propertyName)));
  }
  assign(value: string) {
    for(const assigner of this._assigners) {
      assigner.assign(value);
    }
  }
}

class BranchesAssigner extends Assigner {
  constructor(private _branches: Map<string,ExtendedPhrase>) {
    super();
  }
  getInnerAssigner(propertyName: string) : Assigner {
    if(!this._branches.has(propertyName)) {
      this._branches[propertyName] = {};
    }
    return new PhraseAssigner(this._branches[propertyName]);
  }
}

class SequencesAssigner extends Assigner {
  constructor(private _sequences: Map<string, Tree.Sequence>){
    super();
  }
}


class EventValueAssigner extends Assigner {
  constructor(
    private _event: Tree.PhraseEvent, 
    private _valueKey : string){
    super();
  }
  assign(value: string) {
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

class EventAssigner extends Assigner {
  constructor(private event: Tree.PhraseEvent){
    super();
  }
  getInnerAssigner(propertyName: string) : Assigner {
    return new EventValueAssigner(this.event, propertyName);
  }
}

class EventsAssigner extends Assigner {
  constructor(private _events: Map<number,Tree.PhraseEvent>){
    super();
  }
  getInnerAssigner(eventNum: string) : Assigner {
    let index = fromOneBasedInteger(eventNum);
    if(index == null) { 
      throw new Error('invalid event key');
    }
    if(!this._events.has(index)) {
      this._events.set(index, {values: new Map<string, Tree.ExpressionInput>()});
    }
    return new EventAssigner(this._events.get(index));
  }
}



class SoundAssigner extends Assigner {
  constructor(private _sound: Tree.Sound){
    super();
  }
  getInnerAssigner(input: string) : Assigner {

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

class PhraseAssigner extends Assigner {
  constructor(private _phrase: ExtendedPhrase){
    super();
  }
    getInnerAssigner(propertyName: string) : Assigner {
      switch(propertyName) {
        case Property.Pitch:
          return new PitchAssigner(this._phrase);
        case Property.Tempo:
          return new TempoAssigner(this._phrase);
        case Property.Phrases:
          if(!this._phrase.phrases) {
            this._phrase.phrases = [];
          }
          if(!this._phrase.defaultInnerPhrase) {
            this._phrase.defaultInnerPhrase = {};
          }
          return new PhrasesAssigner(this._phrase.phrases, this._phrase.defaultInnerPhrase);
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
    assign(value : string) {
      if(value == PhrasaSymbol.Beat) {
        this._phrase.beat = true;
      } else {
        super.assign(value);
      }
    }
}

const EventsPostifxRegex = /(.+)~([1-9]\d*)?$/;

export class TreeBuilder extends Listener implements ITreeBuilder {
  private _tree: Tree.PieceTree;
  private _assignerStack: Assigner[];


  build(piece: TextContent, motifs: TextContent[], instruments: TextContent[]) : Tree.PieceTree {
    this._tree = {rootPhrase: {}};
    this._assignerStack = [new PhraseAssigner(this._tree.rootPhrase)];
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
      let newAssigner = this._assignerStack[this._assignerStack.length-1];
      let text = ctx.TEXT().getText();
      const path = this.splitAssignKey(text);
      for(let i=0 ; i<path.length; ++i ){
        if(path[i] == PhrasaSymbol.SelectorSymbol) {
          newAssigner = new SelectorAssigner(path.slice(i+1),newAssigner);
          break;
        }
        newAssigner = newAssigner.getInnerAssigner(path[i])
      }
      this._assignerStack.push(newAssigner);
  }

  enterValue(ctx: PhrasaParser.ValueContext) {
    let assigner = this._assignerStack[this._assignerStack.length-1];
    if(ctx.TEXT()) {
      let text = ctx.TEXT().getText();
      assigner.assign(text);
    } else{
      let op = ctx.operation();
      assigner.assign(op.TEXT(0).getText() + op.OPERATOR().getText() + op.TEXT(1).getText());
    }
  }

  exitNewline_expr(ctx: PhrasaParser.Newline_exprContext) {
    this._assignerStack.pop();
  }
  exitInline_expr(ctx: PhrasaParser.Newline_exprContext) {
    this._assignerStack.pop();
  }

}