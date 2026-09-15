export interface TextPosition {
  line: number;
  col: number;
}

export interface SelectionRange {
  start: TextPosition;
  end: TextPosition;
}

export class DocModel {
  private lines: string[];

  constructor(text = '') {
    this.lines = text.split('\n');
    if (this.lines.length === 0) this.lines = [''];
  }

  getText(): string {
    return this.lines.join('\n');
  }

  get lineCount(): number {
    return this.lines.length;
  }

  getLine(i: number): string {
    return this.lines[i] ?? '';
  }

  lineLength(i: number): number {
    return this.getLine(i).length;
  }

  get maxLineWidth(): number {
    let m = 0;
    for (const l of this.lines) m = Math.max(m, l.length);
    return m;
  }

  offsetToPos(offset: number): TextPosition {
    let remaining = Math.max(0, offset);
    for (let i = 0; i < this.lines.length; i++) {
      const len = this.lines[i]!.length + 1;
      if (remaining < len) {
        return { line: i, col: Math.max(0, Math.min(remaining, this.lines[i]!.length)) };
      }
      remaining -= len;
    }
    return { line: this.lines.length - 1, col: this.lineLength(this.lines.length - 1) };
  }

  posToOffset(pos: TextPosition): number {
    let offset = 0;
    const clampedLine = Math.max(0, Math.min(pos.line, this.lines.length - 1));
    for (let i = 0; i < clampedLine; i++) offset += this.lines[i]!.length + 1;
    offset += Math.max(0, Math.min(pos.col, this.lineLength(clampedLine)));
    return offset;
  }

  clampPos(pos: TextPosition): TextPosition {
    const line = Math.max(0, Math.min(pos.line, this.lines.length - 1));
    return { line, col: Math.max(0, Math.min(pos.col, this.lineLength(line))) };
  }
}

export function lineColToOffset(model: DocModel, line: number, col: number): number {
  return model.posToOffset({ line, col });
}

export function offsetToLineCol(model: DocModel, offset: number): TextPosition {
  return model.offsetToPos(offset);
}