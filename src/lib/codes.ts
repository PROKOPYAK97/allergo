export function parseCode(raw: string): { gtin: string; identity?: string } {
  const value = raw.trim().replace(/^\]d2/, '').replace(/\(01\)/g, '01').replace(/\(21\)/g, '21').replace(/\(9[123]\)/g, '\x1d');
  const marked = value.match(/^01(\d{14})21([^\x1d]+)(?:\x1d.*)?$/s);
  if (marked) return { gtin: marked[1], identity: `01${marked[1]}21${marked[2]}` };
  if (/^(\d{8}|\d{12,14})$/.test(value)) return { gtin: value.padStart(14, '0') };
  throw new Error('Введите EAN/GTIN или полный GS1 Data Matrix: 01 + 14 цифр GTIN + 21 + серийный номер.');
}
