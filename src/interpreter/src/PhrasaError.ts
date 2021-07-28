export interface TextPosition
{
  line: number;
  column: number;
}

export interface ErrorPosition
{
  start: TextPosition;
  end: TextPosition;
  fileName: string;
};

export interface PhrasaError
{
  description: string;
  errorPosition: ErrorPosition;
}