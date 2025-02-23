# typescript-type-transformer

A Babel plugin to generate React PropTypes from TypeScript interfaces or type aliases.

> Does not support converting external type references (as Babel has no type information) without
> the `typeCheck` option being enabled.

> Will add folder named `.cache` to the root of project

## Examples

Supports class components that define generic props.

```tsx
// Before
import React from 'react';

interface Props {
  name?: string;
}

class Example extends React.Component<Props> {
  render() {
    return <div />;
  }
}

// After
import React from 'react';
import PropTypes from 'prop-types';

class Example extends React.Component {
  static propTypes = {
    name: PropTypes.string,
  };

  render() {
    return <div />;
  }
}
```

Function components that annotate the props argument. Also supports anonymous functions without
explicit types (below).

```tsx
// Before
import React from 'react';

interface Props {
  name: string;
}

function Example(props: Props) {
  return <div />;
}

// After
import React from 'react';
import PropTypes from 'prop-types';

function Example(props) {
  return <div />;
}

Example.propTypes = {
  name: PropTypes.string.isRequired,
};
```

And anonymous functions that are annotated as a `React.SFC`, `React.FC`, `React.StatelessComponent`,
or `React.FunctionComponent`.

```tsx
// Before
import React from 'react';

type Props = {
  name?: string;
};

const Example: React.FC<Props> = (props) => <div />;

// After
import React from 'react';
import PropTypes from 'prop-types';

const Example = (props) => <div />;

Example.propTypes = {
  name: PropTypes.string,
};
```

## Requirements

- Babel 7+
- TypeScript 3+

## Installation

```tsx
yarn add --dev typescript-type-transformer
// Or
npm install --save-dev typescript-type-transformer
```

## Usage

Add the plugin to your Babel config. It's preferred to enable this plugin for development only, or
when building a library. Requires either the `@babel/plugin-syntax-jsx` plugin or the
`@babel/preset-react` preset.

```tsx
// babel.config.js
const plugins = [
  [
    'typescript-type-transformer',
     isProduction: process.env.NODE_ENV === 'production',
  ]
];

module.exports = {
  // Required
  presets: [
    [
      '@babel/preset-typescript',
      {
        onlyRemoveTypeImports: true,
      },
    ],
     '@babel/preset-react'
  ]
  plugins,
};
```

When transpiling down to ES5 or lower, the `@babel/plugin-proposal-class-properties` plugin is
required.

### Options

#### isProduction

This option required to determinate when to generate objects.

> Options required and must have value of true or false

#### `comments` (boolean)

Copy comments from original source file for docgen purposes. Requires the `comments` option to also
be enabled in your Babel config. Defaults to `false`.

```tsx
module.exports = {
  plugins: [['typescript-type-transformer', { comments: true }]],
};
```

```tsx
// Before
import React from 'react';

interface Props {
  /** This name controls the fate of the whole universe */
  name?: string;
}

class Example extends React.Component<Props> {
  render() {
    return <div />;
  }
}

// After
import React from 'react';
import PropTypes from 'prop-types';

class Example extends React.Component {
  static propTypes = {
    /** This name controls the fate of the whole universe */
    name: PropTypes.string,
  };

  render() {
    return <div />;
  }
}
```

#### `customPropTypeSuffixes` (string[])

Reference custom types directly when they match one of the provided suffixes. This option requires
the type to be within the file itself, as imported types would be automatically removed by Babel.
Defaults to `[]`.

```tsx
module.exports = {
  plugins: [['typescript-type-transformer', { customPropTypeSuffixes: ['Shape'] }]],
};
```

```tsx
// Before
import React from 'react';
import { NameShape } from './shapes';

interface Props {
  name?: NameShape;
}

class Example extends React.Component<Props> {
  render() {
    return <div />;
  }
}

// After
import React from 'react';
import { NameShape } from './shapes';

class Example extends React.Component {
  static propTypes = {
    name: NameShape,
  };

  render() {
    return <div />;
  }
}
```

#### `forbidExtraProps` (boolean)

Automatically wrap all `propTypes` expressions with
[airbnb-prop-types](https://github.com/airbnb/prop-types) `forbidExtraProps`, which will error for
any unknown and unspecified prop. Defaults to `false`.

```tsx
module.exports = {
  plugins: [['typescript-type-transformer', { forbidExtraProps: true }]],
};
```

```tsx
// Before
import React from 'react';

interface Props {
  name?: string;
}

class Example extends React.Component<Props> {
  render() {
    return <div />;
  }
}

// After
import React from 'react';
import PropTypes from 'prop-types';
import { forbidExtraProps } from 'airbnb-prop-types';

class Example extends React.Component {
  static propTypes = forbidExtraProps({
    name: PropTypes.string,
  });

  render() {
    return <div />;
  }
}
```

#### `implicitChildren` (bool)

Automatically include a `children` prop type to mimic the implicit nature of TypeScript and
`React.ReactNode`. Defaults to `false`.

```tsx
module.exports = {
  plugins: [['typescript-type-transformer', { implicitChildren: true }]],
};
```

```tsx
// Before
import React from 'react';

interface Props {
  foo: string;
}

class Example extends React.Component<Props> {
  render() {
    return <div />;
  }
}

// After
import React from 'react';
import PropTypes from 'prop-types';

class Example extends React.Component {
  static propTypes = {
    foo: PropTypes.string.isRequired,
    children: PropTypes.node,
  };

  render() {
    return <div />;
  }
}
```

#### `maxDepth` (number)

Maximum depth to convert while handling recursive or deeply nested shapes. Defaults to `3`.

```tsx
module.exports = {
  plugins: [['typescript-type-transformer', { maxDepth: 3 }]],
};
```

```tsx
// Before
import React from 'react';

interface Props {
  one: {
    two: {
      three: {
        four: {
          five: {
            super: 'deep';
          };
        };
      };
    };
  };
}

class Example extends React.Component<Props> {
  render() {
    return <div />;
  }
}

// After
import React from 'react';
import PropTypes from 'prop-types';

class Example extends React.Component {
  static propTypes = {
    one: PropTypes.shape({
      two: PropTypes.shape({
        three: PropTypes.object,
      }),
    }),
  };

  render() {
    return <div />;
  }
}
```

#### `maxSize` (number)

Maximum number of prop types in a component, values in `oneOf` prop types (literal union), and
properties in `shape` prop types (interface / type alias). Defaults to `25`. Pass `0` to disable
max.

```tsx
module.exports = {
  plugins: [['typescript-type-transformer', { maxSize: 2 }]],
};
```

```tsx
// Before
import React from 'react';

interface Props {
  one: 'foo' | 'bar' | 'baz';
  two: {
    foo: number;
    bar: string;
    baz: boolean;
  };
  three: null;
}

class Example extends React.Component<Props> {
  render() {
    return <div />;
  }
}

// After
import React from 'react';
import PropTypes from 'prop-types';

class Example extends React.Component {
  static propTypes = {
    one: PropTypes.oneOf(['foo', 'bar']),
    two: PropTypes.shape({
      foo: PropTypes.number,
      bar: PropTypes.string,
    }),
  };

  render() {
    return <div />;
  }
}
```

#### `strict` (boolean)

Enables strict prop types by adding `isRequired` to all non-optional properties. Disable this option
if you want to accept nulls and non-required for all prop types. Defaults to `true`.

```tsx
module.exports = {
  plugins: [['typescript-type-transformer', { strict: true }]],
};
```

```tsx
// Before
import React from 'react';

interface Props {
  opt?: string;
  req: number;
}

class Example extends React.Component<Props> {
  render() {
    return <div />;
  }
}

// After
import React from 'react';
import PropTypes from 'prop-types';

class Example extends React.Component {
  static propTypes = {
    opt: PropTypes.string,
    req: PropTyines.number.isRequired,
  };

  render() {
    return <div />;
  }
}
```

#### `typeCheck` (boolean|string)

_NOT FINISHED_ Resolve full type information for aliases and references using TypeScript's built-in
type checker. When enabled with `true`, will glob for files using `./src/**/*.ts`. Glob can be
customized by passing a string. Defaults to `false`.

> Note: This process is heavy and may increase compilation times.

```tsx
module.exports = {
  plugins: [['typescript-type-transformer', { typeCheck: true }]],
};
```

```tsx
// Before
import React from 'react';
import { Location } from './types';

interface Props {
  location?: Location;
}

class Example extends React.Component<Props> {
  render() {
    return <div />;
  }
}

// After
import React from 'react';
import PropTypes from 'prop-types';

class Example extends React.Component {
  static propTypes = {
    location: PropTypes.shape({
      lat: PropTypes.number,
      long: PropTypes.number,
    }),
  };

  render() {
    return <div />;
  }
}
```

# Type Schema

Following functions are available to convert types to schema.

- transformComponentPropsToSchema
- transformTypeToSchema
- transformTypeToPropTypes
- transformTypeToKeys

### Function Options

- excludeProps?: string[];
- excludeRootProps: ?: string[];
- includeProps?: string[];
- maxDepth?: number;
- disableTransformInEnv?: string[];

## transformComponentPropsToSchema

### Usage:

```
import { transformComponentPropsToSchema } from 'typescript-type-transformer';

export interface ComponentProps {
  prop_a: string;
  prop_b?: boolean;
}

const FunctionComponent = (props: ComponentProps) => {
  return null;
};

transformComponentPropsToSchema(FunctionComponent);

```

Result:

```
FunctionComponent.__propSchema = {
  'type': 'object',
  'properties': {
    'prop_a': {
      'type': 'string'
    },
    'prop_b': {
      'type': 'boolean'
    }
  },
  'required': ['prop_a'],
  'additionalProperties': false
};"
```

## transformTypeToSchema

### Usage:

```
import { transformTypeToSchema } from 'typescript-type-transformer';

export interface TestProps {
  prop_a: string;
  prop_b?: string;
}

const type = transformTypeToSchema<TestProps>();
```

Result

```
const type = {
  'type': 'object',
  'properties': {
    'prop_a': {
      'type': 'string'
    },
    'prop_b': {
      'type': 'string'
    }
  },
  'required': ['prop_a'],
  'additionalProperties': false
};
```

## transformTypeToPropTypes

### Usage:

```
import { transformTypeToPropTypes } from 'typescript-type-transformer';

export interface ComponentProps {
  prop_a: string;
  prop_b?: boolean;
}

const FunctionComponent = (props: ComponentProps) => {
  return null;
};
transformTypeToPropTypes(FunctionComponent);

```

Result:

```
FunctionComponent.propTypes = {
  prop_a: _pt.string.isRequired,
  prop_b: _pt.bool
};"
```

## transformTypeToKeys

### Usage:

```
import { transformTypeToKeys } from 'typescript-type-transformer';

export interface TestProps {
  prop_a: string;
  prop_b?: string;
}

const type = transformTypeToKeys<TestProps>();
```

Result:

```
const type = ['prop_a', 'prop_b'];"
```

## Global options

- generateReactPropTypesManually?: boolean;
- disableGenerateReactPropTypesInEnv?: string[];
- disableGenerateReactPropSchemaInEnv?: string[];
- disableGenerateTypeSchemaInEnv?: string[];
- disableGenerateTypeKeysInEnv?: string[];
