export interface TextPositionPoint
{
  line: number;
  column: number;
}

export interface TextPosition
{
  start: TextPositionPoint;
  end: TextPositionPoint;
  fileName: string;
};

export interface PhrasaError
{
  description: string;
  errorPosition: TextPosition;
}