# intermock [![Build Status](https://api.travis-ci.org/google/intermock.svg?branch=master)](https://travis-ci.org/google/intermock)
Mocking library to create mock objects and JSON for TypeScript interfaces via Faker.

**This is not an officially supported Google product.**

## Installation
```
npm install intermock
```

## CLI
Intermock exposes a CLI, **which is the recommended way to use the tool**. The following subsections show an example file, command, and output to demonstrate using the CLI.

### Example file
```typescript
interface Admin extends User {
   adminRecord: AdminRecord;
}

interface Student extends User {
   schoolRecord: SchoolRecord;
}

interface User {
   firstName: string;
   lastName: string;
   username: string;
   emailAddress: string;
}

interface AdminRecord {
   studentsPassedEachYear: number[];
}

interface SchoolRecord {
   startDate: string;
   endDate: string;
   isActive: boolean;
   grades: number[];
}
```

### Example command
```bash
node ./node_modules/intermock/build/src/cli/index.js --files ./example-file.ts --interfaces "Admin"
```

### Example output
```json
{
  "Admin": {
    "firstName": "Willa",
    "lastName": "Walker",
    "username": "Shyann_Mante",
    "emailAddress": "Cristobal_Rutherford73@gmail.com",
    "adminRecord": {
      "studentsPassedEachYear": [
        80342,
        23404,
        12854,
        74937,
        38185,
        73316
      ]
    }
  },
```

## API Usage
Intermock’s API exports only one function, as seen below:

### Function
```typescript
// Returns an object or string based on `output` property specified in `Options`
mock(options: Options): object|string
```

### Options
```typescript
export interface Options {
 // Array of file tuples. (filename, data)
 files?: Array<[string, string]>;

 // TypeScript is currently the only supported language
 language?: SupportedLanguage;

 // Specific interfaces to write to output
 interfaces?: string[];

 // Used for testing mode,
 isFixedMode?: boolean;

 // One of object|json|string. Strings have their object's functions
 // stringified.
 output?: OutputType;

 // Should optional properties always be enabled
 isOptionalAlwaysEnabled?: boolean;
}
```

## Type Support
The following TypeScript features are supported:
- Interfaces
- Interfaces with properties of primitive types
- Interfaces with property references to other complex types
- Interfaces with extensions
- Unions
- Type aliases
- Arrays
- Namespaces
- Tuples
- Mapped types
- Generics
- Functions (stringified output!)
- Optional properties
- Type imports
- Specific [Faker](https://github.com/marak/Faker.js/#api-methods) data types (via JSDoc comment)
  ```ts
  interface Host {
    /** @mockType {internet.ipv6} */
    addr: string;
  }
  ```


## Building
`npm run build`

## Development
If you want to run the build script and tests after you save a file while developing,
run the following command:
`npm run test-watch`

## Docs
### Developing Docs
To develop documentation run the following commands:
```
npm run build
npm run docs-serve
```

Edit the files in `docs/` and Webpack's Dev Server should auto-reload when there are changes

### Statically Building Docs
To build the docs statically run the following command:
```
npm run build
npm run docs-build
```

## Contributing
1. Read **all** of `CONTRIBUTING.md` in this repo
1. Sign the CLA
1. In a terminal, run `npm run ci`
1. Fix any linting, formatting, and/or compiling errors. (Note: Format errors can be fixed by `npm run format`. DO NOT fix linting errors by disabling the linter on a line and/or block)
1. Create a Pull Request
1. Address all comments, if any
1. If everything looks good after comments are addressed, your PR will be merged!

## License
See `LICENSE` in this repo
