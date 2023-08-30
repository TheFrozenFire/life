export function arrayChunk(array, chunk_size) {
    return Array(Math.ceil(array.length / chunk_size)).fill(0).map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size));
}

export function trimEndByChar(string, character) {
  const arr = Array.from(string);
  const last = arr.reverse().findIndex(char => char !== character);
  return string.substring(0, string.length - last);
}

export function getJSONFieldLength(input, field) {
    const json_input = JSON.parse(input);
    const fieldNameLength = input.match(new RegExp(`"${field}"\\:\\s*`))[0].length;
    const fieldValueLength = JSON.stringify(json_input[field]).length;
    
    return fieldNameLength + fieldValueLength;
}

export function getBase64JSONSlice(input, field) {
    const decoded = Buffer.from(input, 'base64').toString();
    const fieldStart = decoded.indexOf(`"${field}"`);
    const lead = trimEndByChar(Buffer.from(decoded.slice(0, fieldStart)).toString('base64'), '=');
    const fieldLength = getJSONFieldLength(decoded, field);
    const target = trimEndByChar(Buffer.from(decoded.slice(fieldStart, fieldStart + fieldLength)).toString('base64'), '=');
    
    const start = Math.floor(lead.length / 4) * 4;
    const end = Math.ceil(((lead.length + target.length) - 1) / 4) * 4;
    
    return [start, end >= input.length ? input.length - 1 : end - 1];
}

export function buffer2BitArray(b) {
    return [].concat(...Array.from(b.entries()).map(([index, byte]) => byte.toString(2).padStart(8, '0').split('').map(bit => bit == '1' ? 1 : 0) ))
}

export function bitArray2Buffer(a) {
    return Buffer.from(arrayChunk(a, 8).map(byte => parseInt(byte.join(''), 2)))
}

export function bigIntArray2Bits(arr, intSize=16) {
    return [].concat(...arr.map(n => n.toString(2).padStart(intSize, '0').split(''))).map(bit => bit == '1' ? 1 : 0);
}

export function bigIntArray2Buffer(arr, intSize=16) {
    return bitArray2Buffer(bigIntArray2Bits(arr, intSize));
}

export function uint8Array2Hex(arr) {
    return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength).toString('hex');
}

export function getWitnessValue(witness, symbols, varName) {
    return witness[symbols[varName]['varIdx']];
}

export function getWitnessMap(witness, symbols, arrName) {
    return Object.entries(symbols).filter(([index, symbol]) => index.startsWith(arrName)).map(([index, symbol]) => Object.assign({}, symbol, { "name": index, "value": witness[symbol['varIdx']] }) );
}

export function getWitnessArray(witness, symbols, arrName) {
    return Object.entries(symbols).filter(([index, symbol]) => index.startsWith(`${arrName}[`)).map(([index, symbol]) => witness[symbol['varIdx']] );
}

export function getWitnessBuffer(witness, symbols, arrName, varSize=1) {
    const witnessArray = getWitnessArray(witness, symbols, arrName);
    if(varSize == 1) {
        return bitArray2Buffer(witnessArray);
    } else {
        return bigIntArray2Buffer(witnessArray, varSize);
    }
}

export function fromString(s, radix) {
    if ((!radix)||(radix==10)) {
        return BigInt(s);
    } else if (radix==16) {
        if (s.slice(0,2) == "0x") {
            return BigInt(s);
        } else {
            return BigInt("0x"+s);
        }
    }
}

export function fromRprLE(buff, o, n8 = undefined) {
    n8 = n8 || buff.byteLength;
    o = o || 0;
    const v = new Uint32Array(buff.buffer, buff.byteOffset + o, n8/4);
    const a = new Array(n8/4);
    v.forEach( (ch,i) => a[a.length-i-1] = ch.toString(16).padStart(8,"0") );
    return fromString(a.join(""), 16);
}

export function unstringifyBigInts(o) {
    if (typeof o == "string" && /^[0-9]+$/.test(o)) {
        return BigInt(o);
    } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o === null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach((k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

export function ifyBigInts(o, recurse, ifier) {
    if (typeof o == "bigint" || o.eq !== undefined) {
        return ifier(o);
    } else if (o instanceof Uint8Array) {
        return fromRprLE(o, 0);
    } else if (Array.isArray(o)) {
        return o.map(recurse);
    } else if (typeof o == "object") {
        const res = {};
        const keys = Object.keys(o);
        keys.forEach((k) => {
            res[k] = recurse(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

export function stringifyBigInts(o) {
    return ifyBigInts(o, stringifyBigInts, (o) => o.toString(10))
}

export function hexlifyBigInts(o) {
    return ifyBigInts(o, hexlifyBigInts, (o) => "0x" + o.toString(16).padStart(64, '0'))
}