
const INDENT = '  ';

const getIndent = (line: string): number => {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
};

const isCommentOrEmpty = (line: string) => {
    const trimmed = line.trim();
    return trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith('//');
};

const lineContext = (line: string | undefined, lineNo: number, message: string) => {
    if (!line) return message;
    const trimmed = line.trim();
    const preview = trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed || '<blank>';
    return `${message} (line ${lineNo}: ${preview})`;
};

const parsePrimitive = (text: string): any => {
    const trimmed = text.trim();
    if (trimmed === 'null') return null;
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    // Try JSON literals inline (objects/arrays/strings/numbers/bools)
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
            return JSON.parse(trimmed);
        } catch (e) {
            // fall through to other parsing
        }
    }

    // Accept quoted strings (double or single)
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith('\'') && trimmed.endsWith('\''))) {
        const unquoted = trimmed.slice(1, -1);
        return unquoted.replace(/\\"/g, '"').replace(/\\'/g, "'");
    }

    if (!Number.isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed);
    return trimmed;
};

export const parseToon = (inputLines: string[]): any => {
    const lines = inputLines
        .map(line => line.replace(/\r/g, ''))
        .map(line => line.replace(/\t/g, INDENT));

    let i = 0;

    const parseValue = (expectedIndent: number): any => {
        if (i >= lines.length) return null;

        const currentLine = lines[i];
        if (isCommentOrEmpty(currentLine)) {
            i++;
            return parseValue(expectedIndent);
        }
        const firstIndent = getIndent(currentLine);
        if (firstIndent < expectedIndent) return null;

        const trimmed = currentLine.trimStart();

        // Arrays begin with '-'
        if (trimmed.startsWith('-')) {
            const list: any[] = [];

            while (i < lines.length) {
                const line = lines[i];
                if (isCommentOrEmpty(line)) {
                    i++;
                    continue;
                }
                const indent = getIndent(line);
                const clean = line.trimStart();

                if (indent < expectedIndent || !clean.startsWith('-')) break;
                if (indent !== expectedIndent) {
                    throw new Error(lineContext(line, i + 1, `Invalid indentation. Expected ${expectedIndent} spaces.`));
                }

                const afterDash = clean.slice(1).trim();
                const nextLine = lines[i + 1];
                const nextIndent = nextLine !== undefined ? getIndent(nextLine) : -1;

                // Inline object: "- key: value"
                if (afterDash.includes(':')) {
                    const [rawKey, rawRest] = afterDash.split(/:(.*)/);
                    const key = rawKey.trim();
                    const rest = (rawRest ?? '').trim();
                    if (!key) {
                        throw new Error(lineContext(line, i + 1, 'Missing key for inline object'));
                    }

                    if (rest === '' && nextIndent > indent) {
                        i++;
                        list.push({ [key]: parseValue(nextIndent) });
                        continue;
                    }

                    list.push({ [key]: rest ? parsePrimitive(rest) : null });
                    i++;
                    continue;
                }

                if (afterDash === '') {
                    i++;
                    if (nextLine && nextIndent > indent) {
                        list.push(parseValue(nextIndent));
                    } else {
                        list.push(null);
                    }
                    continue;
                }

                list.push(parsePrimitive(afterDash));
                i++;
            }

            return list;
        }

        // Objects
        const obj: Record<string, any> = {};

        while (i < lines.length) {
            const line = lines[i];
            if (isCommentOrEmpty(line)) {
                i++;
                continue;
            }
            const indent = getIndent(line);
            const trimmedLine = line.trim();

            if (indent < expectedIndent) break;
            if (!trimmedLine) {
                i++;
                continue;
            }
            if (indent !== expectedIndent) {
                throw new Error(lineContext(line, i + 1, `Invalid indentation. Expected ${expectedIndent} spaces.`));
            }

            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) {
                throw new Error(lineContext(line, i + 1, "Missing ':' in object property"));
            }

            const key = line.substring(0, colonIndex).trim();
            const valueStr = line.substring(colonIndex + 1).trim();
            const nextLine = lines[i + 1];
            const nextIndent = nextLine !== undefined ? getIndent(nextLine) : -1;

            if (!key) {
                throw new Error(lineContext(line, i + 1, 'Empty key'));
            }

            if (valueStr === '' && nextIndent > indent) {
                i++;
                obj[key] = parseValue(nextIndent);
                continue;
            }

            // Inline object shorthand: key: child: value (only when valueStr looks like key: val)
            const colonIndexInline = valueStr.indexOf(':');
            if (colonIndexInline > -1 && !valueStr.startsWith('{') && !valueStr.startsWith('[')) {
                const childKey = valueStr.slice(0, colonIndexInline).trim();
                const childRest = valueStr.slice(colonIndexInline + 1).trim();
                if (childKey) {
                    obj[key] = { [childKey]: childRest ? parsePrimitive(childRest) : null };
                    i++;
                    continue;
                }
            }

            // Allow JSON literals inline for quick round-trips
            if (valueStr.startsWith('{') || valueStr.startsWith('[')) {
                try {
                    obj[key] = JSON.parse(valueStr);
                    i++;
                    continue;
                } catch (e) {
                    // fall through to primitive parsing
                }
            }

            obj[key] = parsePrimitive(valueStr);
            i++;
        }

        return obj;
    };

    return parseValue(0);
};

const formatPrimitive = (v: any): string => {
    if (typeof v === 'string') return `"${v.replace(/"/g, '\\"')}"`;
    if (v === null) return 'null';
    return String(v);
};

const isPrimitive = (v: any) => v === null || typeof v !== 'object';

const renderArrayItem = (item: any, indentLevel: number): string => {
    const indent = INDENT.repeat(indentLevel);

    if (isPrimitive(item)) {
        return `${indent}- ${formatPrimitive(item)}`;
    }

    const rendered = convertToToon(item, indentLevel + 1);
    const lines = rendered.split('\n');
    const first = lines[0]?.trimStart() ?? '';

    if (lines.length === 1) {
        return `${indent}- ${first}`;
    }

    const rest = lines
        .slice(1)
        .map(l => `${indent}${INDENT}${l.trimStart()}`)
        .join('\n');

    return `${indent}- ${first}\n${rest}`;
};

const convertToToon = (val: any, indentLevel: number): string => {
    const indent = INDENT.repeat(indentLevel);

    if (Array.isArray(val)) {
        if (val.length === 0) return '[]';
        return val.map(item => renderArrayItem(item, indentLevel)).join('\n');
    }

    if (val && typeof val === 'object') {
        const entries = Object.entries(val);
        if (entries.length === 0) return '{}';

        return entries
            .map(([key, v]) => {
                if (isPrimitive(v)) {
                    return `${indent}${key}: ${formatPrimitive(v)}`;
                }

                const rendered = convertToToon(v, indentLevel + 1);
                const lines = rendered.split('\n');

                if (lines.length === 1 && (rendered === '[]' || rendered === '{}')) {
                    return `${indent}${key}: ${rendered}`;
                }

                return `${indent}${key}:\n${lines
                    .map(line => `${indent}${INDENT}${line}`)
                    .join('\n')}`;
            })
            .join('\n');
    }

    return `${indent}${formatPrimitive(val)}`;
};

export const jsonToToon = (value: any): string => convertToToon(value, 0);
