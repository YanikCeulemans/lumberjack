A logging library heavily inspired by Winston, but without the `class`es.

## TODO

- Colorize only for console output by default
- Figure out a sensible default for the splat format (`\n%O\n` might not be the best considering it causes unwanted spaces due to the `.join(' ')`)
- Error handling: What happens to errors that occur during logging?
- Async outputs should work out of the box
- General cleanup and splitting of code
- More edge case testing considering this will be used without typescripts strict mode
- Generate single .js file output?
