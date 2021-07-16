import {Sequence} from './Sequence'
import {TextContent} from './TextContent'
import { PhrasaError } from './PhrasaError'

export interface InterpreterResult {
    errors: PhrasaError[];
    sequence: Sequence;
}

export interface IInterpreter {
    parseEvents(piece: TextContent, motifs: TextContent[], instruments: TextContent[]): InterpreterResult;

}