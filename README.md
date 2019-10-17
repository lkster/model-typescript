# model-typescript

Utilities for creating mutable and immutable models supported by TypeScript

## Table of Contents

1. [Getting Started](#getting-started)
1. [Immutable Model](#immutable-model)
    1. [Complex Types](#complex-types)
    1. [Deep Model Nesting](#deep-model-nesting)
1. [Contribution](#contribution)
1. [What's To Do](#whats-to-do)

## Getting Started

Install `model-typescript` with [npm](https://www.npmjs.com/)

```
$ npm install model-typescript
```

This package needs `reflect-metadata` to work (you can find it [here](https://www.npmjs.com/package/reflect-metadata)) and `emitDecoratorMetadata` option in `tsconfig.json` set to `true`. (until equivalent is released, more info below in todo list)

## Immutable Model

Immutable model allows you to create domain model for data that are completely immutable. The key is to just extend the model class with `ImmutableModel` and add `Prop` decorator for each property. The usage is as follows:

```ts
import { ImmutableModel, Prop } from 'model-typescript';

class UserModel extends ImmutableModel<UserModel> {
    @Prop public readonly id: number;
    @Prop public readonly username: string;
}
```

As you can see, `ImmutableModel` takes generic as the exact model that is being defined. This is needed for proper typing during compilation and intellisense when providing data to the model.

Now when we instantiate it, we can provide data with object literal. After that model is immutable.

```ts
const user = new UserModel({
    id: 2,
    username: 'some username',
});
```

If you want to change the data in model, there is `set` method which takes `Partial` of model's properties (i.e. you can provide only part of the new data model actually can handle) and creates new instance of the model with updated data. The data in old model remains unchanged

```ts
let user = new UserModel({
    id: 2,
    username: 'some username',
});

user.set({
    username: 'some new username',
});

// user.username is still 'some username'

user = user.set({
    username: 'some new username',
});

// now user.username is 'some new username'
```

`ImmutableModel` provides also `clone` method which is just alias for `set({})` (`set` with empty object i.e. no data provided to be changed)

### Complex types

`ImmutableModel` handles cloning plain objects (objects literal and those created through `ObjectConstructor`) and arrays so you can be sure that if you provide some object into model, you won't be able to change it's data through that object

```ts
const data = {
    someObject: {
        name: 'a',
    },
};

const model = new DataModel(data);

expect(data.someObject).not.toBe(model.someObject);
```

Other complex types like own classes or packages are not handled. If you plan to use some mutable class the best case is to override `initModel` method (as it will affect also both `clone` and `set` methods) and handle cloning your custom classes there. Be sure to also lock your entity with `Object.freeze()` method or something custom

```ts
import moment from 'moment';
import { ImmutableModel, Prop, ModelPropertiesOf, ObjectUtils } from 'model-typescript';

class UserModel extends ImmutableModel<UserModel> {
    @Prop public readonly createdAt: moment.Moment

    public initModel(data: ModelPropertiesOf<UserModel>): void {
        super.initModel({
            ...data,
            createdAt: ObjectUtils.deepFreeze(moment(this.createdAt)),
        });
    }
}
```

### Deep model nesting

If you build model which some properties are another models, constructor will handle instantiate them on it's own. All you need to do is just provide data in plain object:

```ts
class AddressModel extends ImmutableModel<AddressModel> {
    @Prop public readonly city: string;
}

class ContactModel extends ImmutableModel<ContactModel> {
    @Prop public readonly email: string;
    @Prop public readonly address: AddressModel;
}

class UserModel extends ImmutableModel<UserModel> {
    @Prop public readonly username: string;
    @Prop public readonly contactDetails: ContactModel;
}

const user = new UserModel({
    username: 'some username',
    contactDetails: {
        email: 'some@user.com',
        address: {
            city: 'some city',
        },
    },
});

// contactDetails property will be ContactModel instance and address property will be AddressModel instance
```

So you don't need to worry about nested objects when putting eg. response from API directly into model

## Contribution

If you want to contribute this utility feel free to create pull request, issue or give a star - everything is welcome!

If something was not well or not at all described, look into unit tests or tip me off (on issue or via email) so we can do something with that.

To help development on this project there are few npm scripts:
- `npm run build` - removes `dist` directory and builds whole project
- `npm run clean` - removes `dist` directory
- `npm run test` - runs unit tests

## What's To Do

- `ModelRef` decorator in case of no `emitDecoratorMetadata` available to set
- Mutable model implementation
- Copying and freezing all natively supported complex types (`Map`, `Set`, `Date`, etc.)
- Global transformers in case of having lot of custom objects values (like `moment` in almost all models). This after setting it up would handle cloning and freezing custom objects out-of-box
- Anything you'd suggest (of course within reason lol)
