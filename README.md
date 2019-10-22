# model-typescript

Utilities for creating mutable and immutable models supported by TypeScript

## Table of Contents

1. [Getting Started](#getting-started)
1. [Immutable Model](#immutable-model)
    1. [Updating Data](#updating-data)
    1. [Cloning Model](#cloning-model)
    1. [Complex Types](#complex-types)
    1. [Deep Model Nesting](#deep-model-nesting)
1. [Mutable Model](#mutable-model)
    1. [Updating Data](#updating-data-1)
    1. [Cloning Model](#cloning-model-1)
    1. [Freezing Model](#freezing-model)
1. [ModelRef decorator](#model-ref)
1. [Contribution](#contribution)

## Getting Started

Install `model-typescript` with [npm](https://www.npmjs.com/)

```
$ npm install model-typescript
```

This package needs `reflect-metadata` to work (you can find it [here](https://www.npmjs.com/package/reflect-metadata)). Recommended is also enabling `emitDecoratorMetadata` option in `tsconfig.json`. If this is not possible then look at `ModelRef` decorator.

## Immutable Model

Immutable model allows you to create domain model for data that is completely immutable. The key is to just extend the model class with `ImmutableModel` and add `@Prop` decorator for each property. The usage is as follows:

```ts
import { ImmutableModel, Prop } from 'model-typescript';

class UserModel extends ImmutableModel<UserModel> {
    @Prop public readonly id: number;
    @Prop public readonly username: string;
}
```

As you can see, `ImmutableModel` takes generic as the exact model that is being defined. This is needed for proper typing during compilation and intellisense when providing data to the model. Also to mention, the `@Prop` decorator can be used like it was above or with parens like `@Prop()`.

Now when we instantiate it, we can provide data with object literal. After that model is immutable.

```ts
const user = new UserModel({
    id: 2,
    username: 'some username',
});
```

### Updating Data

If you want to change the data in model, there is `set` method which takes `Partial` of model's properties (i.e. you can provide just a part of the new data model actually can handle) and creates new instance of the model with updated data. The data in old model remains unchanged

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

### Cloning Model

`ImmutableModel` provides `clone` method which is just alias for `set({})` (`set` with empty object i.e. no data provided to be changed). It returns new deep cloned model. If you have some object in model that is non-native and mutable then it's good to override the method and handle this case:

```ts
class UserModel extends ImmutableModel<UserModel> {
    @Prop public readonly createdAt: moment.Moment;

    public clone(): UserModel {
        return this.set({
            createdAt: moment(moment),
        });
    }
}
```

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

Other complex types like own classes or packages are not handled. If you plan to use some mutable class the best case is to override `defineProperty` method (as it will affect also both `clone` and `set` methods) and handle cloning your custom classes there. Be sure to also lock your entity with `Object.freeze()` method or something custom.

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

As some native JavaScript objects like `Set`, `Map` or `Date` can't be frozen, to gain 100% immutability I'd highly suggest to use [Immutable.js](https://npmjs.com/package/immutable) for data structure objects and [Luxon](https://npmjs.com/package/luxon) instead of `Date` (unless you have other or own solutions). Then as those packages provide immutable objects, we don't need to handle additional steps during cloning models' values. Cloned reference in this case won't affect primary model.

### Deep model nesting

If you build model which some properties are another models, constructor will handle instantiating them on it's own. All you need to do is just provide data in plain object:

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

But again if something in plain object with data needs to be transformed to some custom entity, it needs to be manually handled. Say we have date string and we want to transform it to `Luxon`. This case for example would go as follows:

```ts
class UserModel extends ImmutableModel<UserModel> {
    @Prop public readonly username: string;
    @Prop public readonly createdAt: Luxon.DateTime;
}

const data = {
    username: 'some username',
    createdAt: '2019-01-01',
};

const user = new UserModel({
    ...data,
    createdAt: Luxon.DateTime.fromISO(data.createdAt),  
});
```

Just to mention, for this case we don't need also to handle cloning value of `createdAt` as `Luxon.DateTime` is immutable. Reference in our new cloned model won't affect any data in previous one. 

Btw. if you'd make property as type of some `MutableModel`, it will be frozen with it's `freeze` method. More about it under.

## Mutable Model

Mutable model, as it says, is mutable. Also it doesn't copy any of your object (except some cases, more about that later), just puts reference to object you provide.

```ts
class ContactModel extends MutableModel<ContactModel> {
    @Prop public email: string;
}

class UserModel extends MutableModel<UserModel> {
    @Prop public username: string;
    @Prop public contactDetails: ContactModel;
}

const contactDetails = new ContactModel({
    email: 'some@user.com'
});

const user = new UserModel({
    contactDetails,
    username: 'some username',
});

expect(user.contactDetails).toBe(contactDetails);
```

### Updating Data

There are two possibilities to update data. If you want to simply update some value, just use getter:

```ts
const user = new UserModel({
    username: 'some name',
});

user.username = 'some new user';
```

If you have more properties to update, you can use `set` method.

```ts
const user = new UserModel({
    username: 'some name',
    contactDetails: {
        email: 'some@email.com',
    },
});

user.set({
    username: 'some new name',
    contactDetails: {
        email: 'some@newemail.com',
    },
});
```

`Set` method in this case will update models recursively if they're mutable or assign new if they're immutable. If you provide new model in object data then the old one will be replaced.


### Cloning Model

As immutable model, mutable one also provides `clone` method which clones whole model. The difference is it can take parameter which defines whether clone is supposed to be deep or not. If clone is not deep (this is the standard one) then new model will have passed same references to complex types as the old model.

```ts
const user = new UserModel({
    username: 'some name',
    contactDetails: {
        email: 'some@email.com',
    },
});

const clonedModel = user.clone();

expect(user.contactDetails).toBe(clonedModel.contactDetails);
```

If however the `deepClone` parameter is set to `true` then all values will be also cloned.

```ts
const user = new UserModel({
    username: 'some name',
    contactDetails: {
        email: 'some@email.com',
    },
});

const clonedModel = user.clone(true);

expect(user.contactDetails).not.toBe(clonedModel.contactDetails);
```

### Freezing Model

Freezing mutable model is like making it immutable. After freeze, model can't have any new values assigned. It affects also nested models or objects. However all objects and models are cloned before freeze so there won't be a situation that you passes model from outside and now have it completely immutable.


```ts

const contactDetails = new ContactModel({
    email: 'some@email.com',
});

const user = new UserModel({
    contactDetails,
    username: 'some name',
});


expect(user.contactDetails).toBe(contactDetails);

user.freeze();

expect(user.contactDetails).not.toBe(contactDetails);

expect(contactDetails.isFrozen()).toBe(false);
expect(user.contactDetails.isFrozen()).toBe(true);
```

As you saw, there is also `isFrozen` method which returns `boolean` whether model is actually frozen.

## ModelRef Decorator

Normally `@Prop` decorator handles nested models defining because of what you can just put plain data object in constructor and models will be created automatically. To allow this to happen you need to have `emitDecoratorsMetadata` enabled in your `tsconfig.json` as the decorator bases on reflect metadata about type. In case this is not possible, there is `@ModelRef` decorator to solve this. Simply use it in place of `@Prop` when you're defining property which has type of some another model and provide it's class as parameter:

```ts
class UserModel extends ImmutableModel<UserModel> {
    @Prop() 
    public readonly username: string;
    
    @ModelRef(ContactModel) 
    public readonly contactDetails: ContactModel;
}
```

## Contribution

If you want to contribute this utility feel free to create pull request, issue or give a star - everything is welcome!

If something was not well or not at all described, look into unit tests or tip me off (on issue or via email) so we can do something with that.

To help development on this project there are few npm scripts:
- `npm run build` - removes `dist` directory and builds whole project
- `npm run clean` - removes `dist` directory
- `npm run test` - runs unit tests
