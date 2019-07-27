const colors = {
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  white: '\u001b[37m',
  reset: '\u001b[0m',
};

export function red(text: string) {
  return `${colors.red}${text}${colors.reset}`;
}

export function green(text: string) {
  return `${colors.green}${text}${colors.reset}`;
}

export function yellow(text: string) {
  return `${colors.yellow}${text}${colors.reset}`;
}

export function blue(text: string) {
  return `${colors.blue}${text}${colors.reset}`;
}

export function magenta(text: string) {
  return `${colors.magenta}${text}${colors.reset}`;
}

export function cyan(text: string) {
  return `${colors.cyan}${text}${colors.reset}`;
}

export function white(text: string) {
  return `${colors.white}${text}${colors.reset}`;
}

export function reset(text: string) {
  return `${colors.reset}${text}${colors.reset}`;
}
