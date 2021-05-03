import {InputStream, Token, CommonTokenStream, Recognizer} from 'antlr4'
import PhrasaLexer from "./generated-parser/PhrasaLexer.js"
import PhrasaParser from "./generated-parser/PhrasaParser.js"
import Listener from "./generated-parser/PhrasaListener.js"

import {ITreeBuilder} from './ITreeBuilder'
import * as Tree from './PieceTree'
import {TextContent} from './TextContent'
import { ParseTreeWalker } from 'antlr4/src/antlr4/tree/Tree.js'
import { TerminalNode } from 'antlr4/tree/Tree'

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
  getInnerAssigner(propertyName: string) : Assigner {throw new Error("property unknown");}
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
  Pitch = "pitch",
  Tempo = "tempo",
  Phrases = "phrases",
  Length = "length",
  Branches = "branches",
  Sequences = "sequences",
  Events = "events",
  Event = "event",
  EventStartOffset = "start",
  EventEndOffset = "end",
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
    let index = fromOneBasedInteger(propertyName);
    if(index != null) {
      while(index >= this._phrases.length) {
        this._phrases.push(JSON.parse(JSON.stringify(this._defaultPhrase)));
      }
      return new PhraseAssigner(this._phrases[index]);
    }
    return super.getInnerAssigner(propertyName);
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
    if(this._valueKey === PhrasaSymbol.EventStartOffset) {
      this._event.startOffset = value;
    } else if(this._valueKey === PhrasaSymbol.EventEndOffset) {
      this._event.endOffset = value;
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
  constructor(private _events: Map<number,Tree.PhraseEvent>){
    super();
  }
  getInnerAssigner(input: string) : Assigner {
    if(input == PhrasaSymbol.Events) {
      return new EventsAssigner(this._events);
    } else if(input == PhrasaSymbol.Event) {
      const firstEvent = getOrCreate(this._events, 0, ()=>{return {values: new Map<string, Tree.ExpressionInput>()};});
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
        case PhrasaSymbol.Pitch:
          return new PitchAssigner(this._phrase);
        case PhrasaSymbol.Tempo:
          return new TempoAssigner(this._phrase);
        case PhrasaSymbol.Phrases:
          if(!this._phrase.phrases) {
            this._phrase.phrases = [];
          }
          if(!this._phrase.defaultInnerPhrase) {
            this._phrase.defaultInnerPhrase = {};
          }
          return new PhrasesAssigner(this._phrase.phrases, this._phrase.defaultInnerPhrase);
        case PhrasaSymbol.Length:
          return new LengthAssigner(this._phrase);
        case PhrasaSymbol.Branches:
          if(!this._phrase.branches) {
            this._phrase.branches = new Map<string, Tree.Phrase>();
          }
          return new BranchesAssigner(this._phrase.branches);
        case PhrasaSymbol.Sequences:
          if(!this._phrase.sequences) {
            this._phrase.sequences = new Map<string, Tree.ExpressionInput>();
          }
          return new SequencesAssigner(this._phrase.sequences);
        default:
          if(!this._phrase.sounds) {
            this._phrase.sounds = new Map<string,Map<number, Tree.PhraseEvent>>();
          }
          let soundEvents = getOrCreate(this._phrase.sounds, propertyName, ()=>new Map<number, Tree.PhraseEvent>());
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

  enterKey(ctx: PhrasaParser.KeyContext) {
      let key = ctx.TEXT();
      let newAssigner = this._assignerStack[this._assignerStack.length-1];
      let text = ctx.TEXT().getText();
      text.split('.').forEach((key) => {
        newAssigner = newAssigner.getInnerAssigner(key)
      })
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