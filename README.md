# intermock
Mocking library to create mock objects and JSON for TypeScript interfaces via Faker.

**This is not an officially supported Google product.**

## Installation
```
git clone git@github.com:google/intermock.git
npm install
npm run build
```

## CLI
Intermock exposes a CLI, which is the recommended way to use the tool. The following subsections show an example file, command, and output to demonstrate using the CLI.

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
node build/src/cli/index.js --files ./example-file.ts --interfaces "Admin"
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
The following TypeScript static type features are supported:
- Interfaces
- Interfaces with properties of primitive types
- Interfaces with property references to other complex types
- Interfaces with extensions
- Type aliases
- Arrays
- Namespaces
- Functions (stringified output!)
- Optional properties
- Specific fake data types (via JSDoc comment)


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
See `CONTRIBUTING.md` in this repo

## License
See `LICENSE` in this repo
