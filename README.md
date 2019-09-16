# Model Framework

## What is model?

Model is a basic and the most important constraint of any application.
Your application consist of models and everything you do in your application is all around models.
Let's take a look on a basic model *declartion*:

```ts
interface User {
    id: number
    firstName: string
    lastName: string
}
```

And actual *usage* can be something like this:

```ts
const user: User = {
    id: 1,
    firstName: "Umed",
    lastName: "Khudoiberdiev"
}
```

Next, you mainpulate with your model in your application.
And its all what your application represents.

## What is model framework?

Model framework allows is a set of tools that help you to use models in your apps the most effecient way.
It's opinionated, but every opinion is based on the best practices working with models in different scenarios. 
And also, model framework is designed for usage in cross-platform applications 
with shared logic between your backend frontend or any other environment.

## Model declartion

Model declaration is a type of the model you are going to use.

```ts
export type User = {
    id: number
    firstName: string
    lastName: string
}
```

We are using type declartion (you can also use inteface declartion), 
and it's important to use types instead of classes that contain real code.
Read why we don't use classes for our model declartions in FAQ.

Model declarations are safe to use in the cross packages.
Depend on your project size and scales it can be a good practice to extract your model declartions
into separate package.

## Model reference

Since model declaration is just a type that exists only in a compile time,
we cannot use it runtime to reference some model.
But we do need to reference models when we want to execute operations over them.

```ts
import { Model } from "@vesper/models"
import { User } from "./User"

export const UserModel = new Model<User>("User")
```

This way your application defines a "real" user model and can use it to "tell" to do something with your User model.

> Remember, you cannot reference a type. Type is a TypeScript compile-only feature.

Now imagine where we can use it.
Imagine we have a backend and frontend and we have a basic CRUD manipulation over user.


```ts
// your application: shared code
export const Routes = [
    "/users": UserModel
]
```

```ts
// your application: backend
crudController({
    one: (id: number) => findOneById(UserModel, id),
    many: () => findMany(UserModel),
    save: (user: User) => save(UserModel, user),
    delete: (id: number) => removeById(UserModel, id)
})
```

```ts
// your application: frontend
const user: User = { id: 1, firstName: "Umed", lastName: Khudoibediev }
await save(UserModel, user);
```


```ts
import { Model } from "@vesper/models"
import { User } from "./User"

export const UserModel = new Model<User>("User", {
    id: Number,
    firstName: String,
    lastName: String,
})
```

## FAQ

* What about `new User()`?
* What about factories?
* But static methods are evil

## TODOs

* fix issues with null and undefined
* implement subscriptions
* implement custom manager/repository 
* think if we should create automatic model resolvers
* implement validators for args
* model subscriptions
* implement uploading
* implement custom scalars
* implement logger
* implement date type
* add naming strategy for automatically generated entities
