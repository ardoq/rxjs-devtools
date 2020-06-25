export type SerializeReplacer = (value: any) => any;

enum ReplaceValues {
  TooDeep = '--pruned-beyond-max-depth--',
  AlreadySeen = '--pruned-already-seen--',
}

const replaceValue = (value: any, replacer?: SerializeReplacer) => {
  let newValue = value;
  if (replacer) {
    newValue = replacer(value);
  }
  if (value instanceof Map) {
    newValue = [...value];
  }
  return newValue;
};

const DEFAULT_MAX_DEPTH = 6;
const DEFAULT_ARRAY_MAX_LENGTH = 50;

const escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
  meta = {
    // table of character substitutions
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    '\\': '\\\\',
  };

function quote(string) {
  escapable.lastIndex = 0;
  return escapable.test(string)
    ? `"${string.replace(escapable, function (a) {
        const c = meta[a];
        return typeof c === 'string'
          ? c
          : `\\u${`0000${a.charCodeAt(0).toString(16)}`.slice(-4)}`;
      })}"`
    : `"${string}"`;
}

function str(
  key,
  holder,
  depthDecr: number,
  arrayMaxLength: number,
  replacer: SerializeReplacer,
  seen = new WeakSet()
) {
  let i, // The loop counter.
    k, // The member key.
    v, // The member value.
    length,
    partial,
    value = holder[key];
  if (
    value &&
    typeof value === 'object' &&
    typeof value.toPrunedJSON === 'function'
  ) {
    value = value.toPrunedJSON(key);
  }

  switch (typeof value) {
    case 'string':
      return quote(value);
    case 'number':
      return isFinite(value) ? String(value) : 'null';
    case 'boolean':
      return String(value);
    case 'object':
      if (!value) {
        return 'null';
      }
      if (depthDecr <= 0) {
        return JSON.stringify(ReplaceValues.TooDeep);
      } else if (seen.has(value)) {
        return JSON.stringify(ReplaceValues.AlreadySeen);
      }
      seen.add(value);
      value = replaceValue(value, replacer);
      partial = [];
      if (Object.prototype.toString.apply(value) === '[object Array]') {
        length = Math.min(value.length, arrayMaxLength);
        for (i = 0; i < length; i += 1) {
          partial[i] =
            str(i, value, depthDecr - 1, arrayMaxLength, replacer, seen) ||
            'null';
        }
        v = partial.length === 0 ? '[]' : `[${partial.join(',')}]`;
        return v;
      }
      for (k in value) {
        if (Object.prototype.hasOwnProperty.call(value, k)) {
          try {
            v = str(k, value, depthDecr - 1, arrayMaxLength, replacer, seen);
            if (v) partial.push(`${quote(k)}:${v}`);
          } catch (e) {
            // this try/catch due to some "Accessing selectionEnd on an input element that cannot have a selection." on Chrome
          }
        }
      }
      v = partial.length === 0 ? '{}' : `{${partial.join(',')}}`;
      return v;
  }
}

const jsonPrune = function (
  value,
  depthDecr = DEFAULT_MAX_DEPTH,
  arrayMaxLength = DEFAULT_ARRAY_MAX_LENGTH,
  replacer?: SerializeReplacer
) {
  return str('', { '': value }, depthDecr, arrayMaxLength, replacer);
};

const serialize = (obj: any, replacer?: SerializeReplacer): string => {
  return jsonPrune(obj, 8, 50, replacer);
};

export default serialize;
