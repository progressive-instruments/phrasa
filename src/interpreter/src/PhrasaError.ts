export interface TextPosition
{
  line: number;
  column: number;
}

export interface TextPositionRange
{
  start: TextPosition;
  end: TextPosition;
};

export interface PhrasaError
{
  description: string;
  textPosition: TextPositionRange;
}