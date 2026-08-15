import { timestampToDate } from "./time";

class SeededRandom {
  seed: number;

  constructor(seed: number) {
      this.seed = seed;
  }

  random(): number {
      const x = Math.sin(this.seed++) * 10000;
      return x - Math.floor(x);
  }

  randomInt(min: number, max: number): number {
      return Math.floor(this.random() * (max - min + 1)) + min;
  }
}

// Function to create a seed based on code, relevant data values, and position
function createSeed(code?: string | null, position?: number | null, data?: { [x: string]: any } | null, conditionFn?: ((key: string) => boolean) | null): number {
  if(
    code === null || code === undefined || 
    data === null || data === undefined || 
    position === null || position === undefined || 
    conditionFn === null || conditionFn === undefined
  ) return 0
  const relevantData = Object.keys(data)
      .filter(key => conditionFn(key))
      .map(key => data[key].toString().replace(/\s+/g, ''))
      .join('');
  const seedString = (code + relevantData + position.toString()).toLowerCase();
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
      seed = (seed << 5) - seed + seedString.charCodeAt(i);
      seed |= 0; // Convert to 32-bit integer
  }
  return seed;
}

function formatDate(date: Date, format: string): string {
  //console.log("formatDate:", date, "format", format)
  try {
    //console.log("formatDate:2", date, "format", format, date.getFullYear().toString())

  } catch(e: any) {
    //console.log("formatDate:error", date, "format", format, "error", e.message)
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const replacements: {[x: string]: string} = {
      YYYY: date.getFullYear().toString(), // Full year
      YY: String(date.getFullYear()).slice(-2), // Last two digits of year
      MMMM: monthNames[date.getMonth()], // Full month name
      MMM: monthNames[date.getMonth()].slice(0, 3), // Abbreviated month name
      MM: String(date.getMonth() + 1).padStart(2, '0'), // Month number with leading zero
      M: (date.getMonth() + 1).toString(), // Month number without leading zero
      DD: String(date.getDate()).padStart(2, '0'), // Day of the month with leading zero
      D: date.getDate().toString(), // Day of the month without leading zero
      dddd: dayNames[date.getDay()], // Full day of the week name
      ddd: dayNames[date.getDay()].slice(0, 3), // Abbreviated day of the week name
      HH: String(date.getHours()).padStart(2, '0'), // Hour (24-hour format) with leading zero
      H: date.getHours().toString(), // Hour (24-hour format) without leading zero
      hh: String((date.getHours() % 12) || 12).padStart(2, '0'), // Hour (12-hour format) with leading zero
      h: ((date.getHours() % 12) || 12).toString(), // Hour (12-hour format) without leading zero
      mm: String(date.getMinutes()).padStart(2, '0'), // Minutes with leading zero
      m: date.getMinutes().toString(), // Minutes without leading zero
      ss: String(date.getSeconds()).padStart(2, '0'), // Seconds with leading zero
      s: date.getSeconds().toString(), // Seconds without leading zero
      A: date.getHours() < 12 ? 'AM' : 'PM', // AM or PM
      a: date.getHours() < 12 ? 'am' : 'pm' // am or pm
  };

  // Handle escape characters
  return replacements[format] || "";
}

// Example usage:
//const today = new Date();
//const formatString = "Hello James, today is \\YYYY/MM/DD, and it's \\dddd! Current time is HH:mm:ss \\(\\AM/PM\\).";
//console.log(formatDate(today, formatString));
// Output example: "Hello James, today is YYYY/MM/DD, and it's dddd! Current time is 14:25:09 (AM/PM)."

export function textGenCodeParser(code: string | null, data: { [x: string]: any } | null, conditionFn?: (key: string) => boolean, onData?: (dataKey: string, data: string) => string) {
  if (!code || !data) return "";

  // Helper function to get words from a string
  function getWords(str: string) {
      return str.split(' ');
  }

  // Function to generate a random number based on seed
  function randomNumber(min: string, max: string, position: number) {
      const seed = conditionFn ? createSeed(code, position, data, conditionFn) : Math.random() * 1000000;
      const seededRandom = new SeededRandom(seed);

      // Check if min and max are numbers or number of digits
      const isDigits = (value: any) => typeof value === 'string' && value.endsWith('d');
      const isNumber = (value: any) => !isNaN(value) && !isDigits(`${value}`);

      if (isNumber(min) && isNumber(max)) {
          // Generate random number within the specified range
          return seededRandom.randomInt(parseInt(min), parseInt(max)).toString();
      } else if (isDigits(min) && isDigits(max)) {
          // Parse number of digits from min and max
          const minDigits = parseInt(min);
          const maxDigits = parseInt(max);

          // Generate a random number with a random number of digits between minDigits and maxDigits
          let result = '';
          let currentDigits = 0;

          const numOfDigits = seededRandom.randomInt(minDigits, maxDigits);

          while (currentDigits < numOfDigits) {
              const num = seededRandom.randomInt(1, 9); // Ensure the first digit is not zero
              result += num.toString();
              currentDigits = result.length;
          }

          return result;
      } else if (isDigits(min)) {
          // Generate a number with exactly min digits
          const minDigits = parseInt(min);
          let result = seededRandom.randomInt(1, 9).toString(); // Ensure the first digit is not zero

          for (let i = 1; i < minDigits; i++) {
              const num = seededRandom.randomInt(0, 9); // Include zero as a possible digit
              result += num.toString();
          }

          return result;
      } else if (isNumber(min)) {
          return Math.round(seededRandom.random() * parseInt(min)).toString();
      } else {
          // Invalid input scenario
          return 'Invalid arguments for randomNumber function: ' + `Min: ${min} - ${typeof min} | Max: ${max} - ${typeof max}`;
      }
  }

  // Helper function to handle variable substitution
  function substituteVariable(key: string) {
      if (!data) return '';
      key = key.replace(/[{}]+/g, "");
      // Check if the variable has a word slice
      const wordSliceMatch = key.match(/(.+)\[w(\d+)\]/);
      if (wordSliceMatch) {
        const [, baseKey, wordIndex] = wordSliceMatch;
        const d = onData? onData(baseKey, data[baseKey] || '') : data[baseKey]
        const words = getWords(d || '');

        //if(key.includes("id")) console.log("textGenCodeParser.match.l.d", key, baseKey, data[baseKey])
        return words[parseInt(wordIndex) - 1] || '';

      } else if (key in data) {
          //if(key.includes("id")) console.log("textGenCodeParser.match.l.e", key, data[key])
          const d = onData? onData(key, data[key] || '') : data[key]
          //if(key.includes("id")) console.log("textGenCodeParser.match.l.f", d)
          return d;
      }
      return '';
  }

  function extractVariables(code: string) {
    const regex = /{([^{}]+?)}(\.\w+\[(.*?)\])?/g;
    const results = [];
    let match;
    //console.log("textGenCodeParser.match.1", match, "code", code)
      while ((match = regex.exec(code)) !== null) {
          //if(code.includes("id")) console.log("textGenCodeParser.match.l.a", match, "code", code)
          const varKey = match[1];
          const varFunc = match[2] ? match[2].split('[')[0].slice(1) : null;
          const varFuncArgs = match[3] ? match[3].split(',').map(arg => arg.trim()) : [];
  
          const replacementStart = match.index;
          const replacementEnd = match.index + match[0].length - 1;
  
          const extracts = {
            varKey,
            varFunc: varFunc || undefined,
            varFuncArgs: varFuncArgs.length ? varFuncArgs : undefined,
            replacementStart,
            replacementEnd
          }

          //if(code.includes("id")) console.log("textGenCodeParser.match.l.b", match, "code", code, "extracts", extracts)

          results.push(extracts);
      }
  
      return results;
  }

  function replaceSubtext(text: string, replacementText: string, start: number, end: number) {
    // Extract the parts
    const before = text.slice(0, start);
    const after = text.slice(end + 1);

    // Construct the new text
    return before + replacementText + after;
  }

  function cut(variable: any, varA: string, varB?: string) {
    var var1 = parseInt(varA)
    var var2 = parseInt(varB || "")
    return isNaN(var2)? variable.substring(var1 - 1) : variable.substring(var1 - 1, var2)
  }
  
  function callVarFunc (variable: any, varFunc: string, varFuncArgs: string[] | undefined) {
    var result = null
    switch (varFunc) {
      case "cut":
        if(varFuncArgs && [1, 2].includes(varFuncArgs.length)) {
          try {

            result = cut(variable, varFuncArgs[0], varFuncArgs[1])

          } catch(e) {}
        }
        break;
      case "df":
        if(varFuncArgs && [1,2,3].includes(varFuncArgs.length)) {
          try {
            var format = varFuncArgs[0]
            var date = variable == "_"? new Date() : timestampToDate(variable)

            result = formatDate(date, format)
            if(varFuncArgs.length > 1) {
              result = cut(result, varFuncArgs[1], varFuncArgs[2])
            }

          } catch(e) {console.log(e)}
        }
        break;
    
      default:
        break;
    }

    return result

  }

  // Replace variables and handle special syntax
  const repList: { id: string, char: string, count: number }[] = [];
  let positionCounter = 0;
  let intermediateResult = code.replace(/\(([^()]*)\)/g, (match, p1) => {
      // Check for special syntax within parentheses
      if (p1.startsWith("rn[")) {
          // Random number generation
          const [min, max] = p1.slice(3, -1).split(',');
          return randomNumber(min, max, positionCounter++);
      } else if (p1.match(/^([^*]+)(\*{1,2})(\d+)$/)) {
          // Fixed count repetition
          const [, char, operand, count] = p1.match(/^([^*]+)(\*{1,2})(\d+)$/) || [];
          const total = parseInt(count);
          // Repeat until the chars is the number of count
          if (operand == "*") {
              return char.repeat(total);
          } // Repeat until the whole generated text length is the number of count
          else {
              const repId = `<${Math.floor(Math.random() * 1000000000)}>`;
              repList.push({ id: repId, char, count: total });
              return repId;
          }
      } else if (p1.includes("{") && p1.includes("}")) {
        // Variable substitution
        //'abc{var}ghi', 'abc{var}', '{var}'
        var p1CodeExtraction = extractVariables(p1)

        // Sort the extractions in reverse order of `replacementStart` to avoid position shifting during replacements
        p1CodeExtraction.sort((a, b) => b.replacementStart - a.replacementStart);

        //if(code.includes("id")) console.log("textGenCodeParser.match.l.c", match, "code", code, p1CodeExtraction)

        for(const extraction of p1CodeExtraction) {
          var variable = substituteVariable(extraction.varKey)
          if(extraction.varFunc) {
            variable = callVarFunc(variable, extraction.varFunc, extraction.varFuncArgs)
          }

          if(variable && p1.length > 0) {
            p1 = replaceSubtext(p1, variable, extraction.replacementStart, extraction.replacementEnd)

          } else {
            p1 = ""
            break
          }
        }
        
        return p1;
      } else {
          return p1;
      }
  });

  for (const rep of repList) {
      const textLength = (intermediateResult.length - rep.id.length);
      if (textLength >= rep.count) {
          break;
      }
      const reps = rep.char.repeat(rep.count - textLength);
      intermediateResult = intermediateResult.replace(rep.id, reps);
  }

  return intermediateResult;
}