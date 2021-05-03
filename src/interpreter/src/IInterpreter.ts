import {Sequence} from './Sequence'
import {TextContent} from './TextContent'

export interface IInterpreter {
    parseEvents(piece: TextContent, motifs: TextContent[], instruments: TextContent[]): Sequence;

}