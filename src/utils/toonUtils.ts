
const getIndent = (line: string): number => {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
};

const parsePrimitive = (text: string): any => {
    const trimmed = text.trim();
    if (trimmed === 'null') return null;
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (!isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed);
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, -1).replace(/\\"/g, '"');
    }
    // Return as-is if it's an unquoted string
    return trimmed;
};

export const parseToon = (lines: string[]): any => {
    let i = 0;

    const parseValue = (currentIndent: number): any => {
        const firstLine = lines[i];
        if (firstLine === undefined) return null;

        const firstIndent = getIndent(firstLine);

        // Handle arrays
        if (firstLine.trim().startsWith('-')) {
            const list: any[] = [];
            while (i < lines.length) {
                const line = lines[i];
                if (getIndent(line) < firstIndent) break;
                if (getIndent(line) > firstIndent) {
                    throw new Error(`Invalid indentation at line ${i + 1}. Expected ${firstIndent} spaces.`);
                }
                if (!line.trim()) {
                    i++;
                    continue;
                }

                const itemContent = line.trim().substring(1).trim();
                
                // If the next line is more indented, it's a nested object
                const nextLine = lines[i + 1];
                if (nextLine && getIndent(nextLine) > firstIndent) {
                    i++; // Consume the '- ' line
                    list.push(parseValue(getIndent(nextLine)));
                } else {
                    list.push(parsePrimitive(itemContent));
                    i++;
                }
            }
            return list;
        }

        // Handle objects
        const obj: any = {};
        while (i < lines.length) {
            const line = lines[i];
            if (getIndent(line) < firstIndent) break;
            if (!line.trim()) {
                i++;
                continue;
            }

            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) {
                throw new Error(`Missing ':' in object property at line ${i + 1}`);
            }

            const key = line.substring(0, colonIndex).trim();
            const valueStr = line.substring(colonIndex + 1).trim();

            const nextLine = lines[i + 1];

            if (valueStr === '' && nextLine && getIndent(nextLine) > firstIndent) {
                i++; // Consume object key line
                obj[key] = parseValue(getIndent(nextLine));
            } else {
                obj[key] = parsePrimitive(valueStr);
                i++;
            }
        }
        return obj;
    };

    return parseValue(0);
};

export const jsonToToon = (value: any): string => {
    const formatPrimitive = (v: any): string => {
        if (typeof v === 'string') return `"${v.replace(/"/g, '\\"')}"`;
        if (v === null) return 'null';
        return String(v);
    };

    const convert = (val: any, indentLevel: number): string => {
        const indent = '  '.repeat(indentLevel);

        if (Array.isArray(val)) {
            if (val.length === 0) return '[]';
            return val.map(item => {
                const nextLine = convert(item, indentLevel + 1);
                // Handle nested objects/arrays vs primitives differently
                if (nextLine.trim().startsWith('-') || (typeof item === 'object' && item !== null)) {
                    return `${indent}- \n${nextLine}`;
                } else {
                    return `${indent}- ${item === null ? 'null' : nextLine.trim()}`;
                }
            }).join('\n');
        }

        if (typeof val === 'object' && val !== null) {
            if (Object.keys(val).length === 0) return '{}';
            return Object.entries(val).map(([key, v]) => {
                if (typeof v === 'object' && v !== null) {
                    return `${indent}${key}:\n${convert(v, indentLevel + 1)}`;
                } else {
                    return `${indent}${key}: ${formatPrimitive(v)}`;
                }
            }).join('\n');
        }

        return indent + formatPrimitive(val);
    };

    return convert(value, 0);
};
