export type Lang = 'ts' | 'js' | 'html' | 'css' | 'json' | 'md' | 'ha' | 'text';

export type TokenType =
  | 'keyword'
  | 'type'
  | 'function'
  | 'string'
  | 'number'
  | 'comment'
  | 'tag'
  | 'attribute'
  | 'property'
  | 'operator'
  | 'punctuation'
  | 'plain';

export interface Token {
  type: TokenType;
  text: string;
}

export const TS_KEYWORDS: ReadonlySet<string> = new Set([
  'abstract','as','async','await','break','case','catch','class','const',
  'continue','debugger','default','delete','do','else','enum','export',
  'extends','false','finally','for','from','function','get','if','implements',
  'import','in','instanceof','interface','let','new','null','of','override',
  'private','protected','public','readonly','return','set','static','super',
  'switch','this','throw','true','try','type','typeof','undefined','var',
  'void','while','with','yield','satisfies','keyof','infer','never','unknown',
  'any','namespace','declare','module','require','global','as const',
]);

export const HA_KEYWORDS: ReadonlySet<string> = new Set([
  'use','fn','export','let','const','type','struct','enum','switch','case',
  'return','if','else','while','for','yield','alloc','free','cancel','abort',
  'def','union','defer','match','true','false','null','void','assert',
]);

const JS_BUILTINS: ReadonlySet<string> = new Set([
  'console','Math','JSON','Object','Array','String','Number','Boolean',
  'Promise','Set','Map','Date','RegExp','Error','document','window',
  'process','Buffer','globalThis','Infinity','NaN','Symbol','BigInt',
  'Function','Intl','URL','fetch','setTimeout','setInterval','clearTimeout',
  'clearInterval','localStorage','sessionStorage','navigator','require',
]);

const TS_NATIVE_TYPES: ReadonlySet<string> = new Set([
  'string','number','boolean','symbol','bigint','object','unknown','never',
  'void','any','null','undefined','Date','Promise','Map','Set','Array',
  'Record','Partial','Readonly','Pick','Omit','Exclude','Extract',
]);

const CSS_PROPERTY_NAMES: ReadonlySet<string> = new Set([
  'position','display','flex','grid','gap','margin','padding','top','left',
  'right','bottom','width','height','min-width','max-width','min-height',
  'max-height','color','background','background-color','background-image',
  'border','border-top','border-left','border-bottom','border-right',
  'border-radius','box-shadow','font-family','font-size','font-weight',
  'line-height','text-align','text-decoration','text-transform','opacity',
  'z-index','overflow','overflow-x','overflow-y','transform','transition',
  'animation','filter','backdrop-filter','justify-content','align-items',
  'align-content','flex-direction','flex-wrap','flex-grow','flex-shrink',
  'grid-template','grid-template-columns','grid-template-rows','gap','column-gap',
  'row-gap','cursor','pointer-events','user-select','white-space','content',
  'position','float','clear','visibility','letter-spacing','word-spacing',
  'word-break','overflow-wrap','box-sizing','object-fit','inset','margin-inline',
  'margin-block','padding-inline','padding-block',
]);

const CSS_AT_RULES: ReadonlySet<string> = new Set([
  'import','media','supports','keyframes','charset','namespace','layer',
  'container','property','font-face','page','starting-style',
]);

const HA_TYPES: ReadonlySet<string> = new Set([
  'str','char','rune','i8','i16','i32','i64','u8','u16','u32','u64','f32',
  'f64','bool','size','uintptr','int','uint','error','void',
]);

export function detectLang(filename: string): Lang {
  const f = filename.toLowerCase();
  if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.mts')) return 'ts';
  if (f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.mjs') || f.endsWith('.cjs')) return 'js';
  if (f.endsWith('.html') || f.endsWith('.htm')) return 'html';
  if (f.endsWith('.css')) return 'css';
  if (f.endsWith('.json')) return 'json';
  if (f.endsWith('.md') || f.endsWith('.markdown')) return 'md';
  if (f.endsWith('.ha')) return 'ha';
  return 'text';
}

export const LANG_LABEL: Record<Lang, string> = {
  ts: 'TypeScript TS',
  js: 'JavaScript JS',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  md: 'Markdown MD',
  ha: 'Hare .HA',
  text: 'Plain Text',
};

export interface Carry {
  inBlockComment: boolean;
  inTemplate: boolean;
  prevPunct: string;
  isRawMode: boolean;
}

export const freshCarry = (): Carry => ({
  inBlockComment: false,
  inTemplate: false,
  prevPunct: '',
  isRawMode: false,
});

interface LineScan {
  tokens: Token[];
  carry: Carry;
}

function isWordChar(c: string): boolean {
  return /[A-Za-z0-9_$]/.test(c);
}
function isDigit(c: string): boolean {
  return /[0-9]/.test(c);
}
function isSpace(c: string): boolean {
  return /\s/.test(c);
}

function wordType(word: string, lang: Lang, isProperty: boolean): TokenType {
  const keywords = lang === 'ha' ? HA_KEYWORDS : TS_KEYWORDS;
  if (keywords.has(word)) return 'keyword';
  if (lang === 'ha') {
    if (HA_TYPES.has(word)) return 'type';
  }
  if ((lang === 'js' || lang === 'ts') && JS_BUILTINS.has(word)) return 'keyword';
  if ((lang === 'ts' || lang === 'js') && TS_NATIVE_TYPES.has(word)) return 'type';
  if (isProperty) return 'property';
  if (/^[A-Z]/.test(word)) return 'type';
  return 'plain';
}

function scanWord(line: string, i: number): { start: number; end: number } {
  let end = i;
  while (end < line.length && isWordChar(line[end]!)) end++;
  return { start: i, end };
}

function scanString(line: string, i: number, quote: string): { end: number } {
  let p = i + 1;
  while (p < line.length) {
    const ch = line[p]!;
    if (ch === '\\') {
      p += 2;
      continue;
    }
    if (ch === quote) return { end: p + 1 };
    p++;
  }
  return { end: line.length };
}

export function tokenizeCode(code: string, lang: Lang): Token[][] {
  return tokenizeLines(code, lang);
}

export function tokenizeLines(text: string, lang: Lang): Token[][] {
  const result: Token[][] = [];
  let carry = freshCarry();

  for (const rawLine of text.split('\n')) {
    const line = rawLine;
    const scan = scanLine(line, lang, carry);
    carry = scan.carry;
    result.push(scan.tokens);
  }

  return result;
}

function scanLine(line: string, lang: Lang, carryIn: Carry): LineScan {
  const tokens: Token[] = [];
  const carry = { ...carryIn };
  let i = 0;
  let isProperty = lang === 'css' && /^\s*[A-Za-z-]+:/.test(line);
  let inTag = false;

  if (lang === 'json' && /^\s*"/.test(line)) {
    isProperty = true;
  }

  if (carry.isRawMode) {
    const end = line.indexOf('```');
    if (end === -1) {
      tokens.push({ type: 'plain', text: line });
      return { tokens, carry };
    }
    tokens.push({ type: 'plain', text: line.slice(0, end) });
    tokens.push({ type: 'string', text: '```' });
    carry.isRawMode = false;
    i = end + 3;
  }

  while (i < line.length) {
    let done = false;

    // Block comments spanning lines
    if (carry.inBlockComment) {
      const end = line.indexOf('*/', i);
      if (end === -1) {
        tokens.push({ type: 'comment', text: line.slice(i) });
        return { tokens, carry };
      }
      tokens.push({ type: 'comment', text: line.slice(i, end + 2) });
      i = end + 2;
      carry.inBlockComment = false;
      done = true;
    }
    if (done) continue;

    const ch = line[i]!;

    if (isSpace(ch)) {
      let j = i;
      while (j < line.length && isSpace(line[j]!)) j++;
      tokens.push({ type: 'plain', text: line.slice(i, j) });
      i = j;
      continue;
    }

    // Comments
    if (ch === '/' && line[i + 1] === '/') {
      tokens.push({ type: 'comment', text: line.slice(i) });
      break;
    }
    if (ch === '/' && line[i + 1] === '*') {
      const end = line.indexOf('*/', i + 2);
      if (end === -1) {
        carry.inBlockComment = true;
        tokens.push({ type: 'comment', text: line.slice(i) });
        break;
      }
      tokens.push({ type: 'comment', text: line.slice(i, end + 2) });
      i = end + 2;
      continue;
    }

    // HTML tag / attribute
    if (lang === 'html') {
      if (ch === '<') {
        const isClose = line[i + 1] === '/';
        let j = isClose ? i + 2 : i + 1;
        while (j < line.length && (isWordChar(line[j]!) || line[j] === ':' || line[j] === '-')) {
          j++;
        }
        tokens.push({ type: 'tag', text: line.slice(i, j) });
        inTag = true;
        i = j;
        continue;
      }
      if (ch === '>' || (ch === '/' && line[i + 1] === '>')) {
        tokens.push({ type: 'tag', text: line.slice(i, i + (ch === '>' ? 1 : 2)) });
        inTag = false;
        i += ch === '>' ? 1 : 2;
        continue;
      }
      if (inTag && isWordChar(ch) && !isSpace(ch)) {
        let j = i;
        while (j < line.length && (isWordChar(line[j]!) || line[j] === '-' || line[j] === ':')) j++;
        tokens.push({ type: 'attribute', text: line.slice(i, j) });
        i = j;
        continue;
      }
      if (inTag && (ch === '"' || ch === "'")) {
        const s = scanString(line, i, ch);
        tokens.push({ type: 'string', text: line.slice(i, s.end) });
        i = s.end;
        continue;
      }
      if (inTag && ch === '=') {
        tokens.push({ type: 'operator', text: '=' });
        i++;
        continue;
      }
      if (ch === '/' && line[i + 1] === '>') {
        tokens.push({ type: 'tag', text: '/>' });
        i += 2;
        continue;
      }
    }

    // Markdown
    if (lang === 'md') {
      if (ch === '#' && (i === 0 || isSpace(line[i - 1]!))) {
        tokens.push({ type: 'tag', text: line.slice(i) });
        break;
      }
      if (line.startsWith('```', i)) {
        tokens.push({ type: 'string', text: '```' });
        carry.isRawMode = !carry.isRawMode;
        i += 3;
        continue;
      }
      if (ch === '*') {
        tokens.push({ type: 'operator', text: '*' });
        i++;
        continue;
      }
      if (ch === '`') {
        const s = scanString(line, i, '`');
        tokens.push({ type: 'comment', text: line.slice(i, s.end) });
        i = s.end;
        continue;
      }
      if (ch === '[') {
        tokens.push({ type: 'tag', text: '[' });
        i++;
        continue;
      }
      if (ch === ']' || ch === '(' || ch === ')') {
        tokens.push({ type: 'punctuation', text: ch });
        i++;
        continue;
      }
    }

    // Strings
    if ((ch === '"' || ch === "'") && lang !== 'text' && lang !== 'md' && lang !== 'html') {
      const s = scanString(line, i, ch);
      tokens.push({ type: 'string', text: line.slice(i, s.end) });
      i = s.end;
      continue;
    }
    if (ch === '`' && (lang === 'ts' || lang === 'js')) {
      const s = scanString(line, i, '`');
      tokens.push({ type: 'string', text: line.slice(i, s.end) });
      i = s.end;
      continue;
    }
    if ((ch === '"' || ch === "'") && lang === 'html' && !inTag) {
      const s = scanString(line, i, ch);
      tokens.push({ type: 'string', text: line.slice(i, s.end) });
      i = s.end;
      continue;
    }

    // CSS
    if (lang === 'css') {
      if (ch === '{') {
        tokens.push({ type: 'punctuation', text: '{' });
        isProperty = true;
        i++;
        continue;
      }
      if (ch === '}') {
        tokens.push({ type: 'punctuation', text: '}' });
        isProperty = false;
        i++;
        continue;
      }
      if (ch === ';') {
        tokens.push({ type: 'punctuation', text: ';' });
        isProperty = true;
        i++;
        continue;
      }
      if (ch === ':' ) {
        tokens.push({ type: 'operator', text: ':' });
        i++;
        continue;
      }
      if (isWordChar(ch) || ch === '-' || ch === '_') {
        const w = scanWord(line, i);
        const word = line.slice(w.start, w.end);
        if (isProperty) {
          tokens.push({ type: CSS_PROPERTY_NAMES.has(word) || /^[a-z]+(-[a-z0-9]+)*$/.test(word) ? 'property' : 'property', text: word });
        } else if (word.startsWith('--')) {
          tokens.push({ type: 'attribute', text: word });
        } else if (CSS_AT_RULES.has(word.replace('@', ''))) {
          tokens.push({ type: 'keyword', text: word });
        } else {
          tokens.push({ type: 'plain', text: word });
        }
        i = w.end;
        continue;
      }
      if (ch === '@') {
        let j = i;
        while (j < line.length && isWordChar(line[j]!) ) j++;
        tokens.push({ type: 'keyword', text: line.slice(i, j) });
        i = j;
        continue;
      }
      if (ch === '#') {
        let j = i;
        while (j < line.length && (/[A-Za-z0-9_-]/.test(line[j]!))) j++;
        tokens.push({ type: 'attribute', text: line.slice(i, j) });
        i = j;
        continue;
      }
      if (ch === '.') {
        tokens.push({ type: 'punctuation', text: '.' });
        i++;
        continue;
      }
    }

    // Numbers
    if (isDigit(ch) || (ch === '.' && isDigit(line[i + 1] ?? ''))) {
      const numMatch = /^\d[\d_]*(\.\d+)?([eE][+-]?\d+)?/.exec(line.slice(i));
      if (numMatch) {
        tokens.push({ type: 'number', text: numMatch[0] });
        i += numMatch[0].length;
        continue;
      }
    }

    // Words / identifiers
    if (isWordChar(ch)) {
      const w = scanWord(line, i);
      const word = line.slice(w.start, w.end);
      const nextCh = line[w.end];
      let t: TokenType = wordType(word, lang, isProperty);
      if (nextCh === '(') {
        t = 'function';
      }
      if (word === 'this' || word === 'window' || word === 'document') {
        t = 'keyword';
      }
      if (lang === 'ts' && /^[A-Z][A-Za-z0-9_]*$/.test(word) && !TS_KEYWORDS.has(word)) {
        t = 'type';
      }
      if (isProperty && lang === 'json') {
        t = 'attribute';
      }
      tokens.push({ type: t, text: word });
      i = w.end;
      continue;
    }

    // Operators / punctuation
    if (/[+\-*/%<>=!&|^~:?]/.test(ch)) {
      let j = i;
      while (j < line.length && /[+\-*/%<>=!&|^~:?]/.test(line[j]!)) j++;
      tokens.push({ type: 'operator', text: line.slice(i, j) });
      i = j;
      continue;
    }
    if (/[[](){}.,;]/.test(ch)) {
      tokens.push({ type: 'punctuation', text: ch });
      i++;
      continue;
    }

    // HTML content text
    tokens.push({ type: 'plain', text: ch });
    i++;
  }

  return { tokens, carry };
}