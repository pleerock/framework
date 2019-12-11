# Model Framework Design Philosophy

## What is a Model?

Model is a basic and the most important constraint of any application.
Your application consist of models and everything you do in your application is all around models.
This makes models fundamental part of the application, 
and any logic in your app depend on how you design your models.

## What is a Model Framework

There are many non-trivial problems when designing and working with models in your app - 
Model Framework provides you a design, patterns and abstractions on how to create and design models in your app,
preventing many problems you are going to face when you write a truly scalable, 
maintainable, type-safe applications. 
Model framework tries to resolve following most common design problems:

* How to design type-safe models depend on what model portion you are working with
* How to design type-save multi-platform and multi-client applications
* How to design a communication between multi-platform and multi-client applications
* How to properly share your code between client and server / multiple platforms / multiple servers
* How to properly design your code to write a scalable models

## Answers to your questions and complains

* be ready for code duplication, especially for type definition duplication

    Some people are super paranoiac about DRY and they try to make DRY code everywhere as possible.
    DRY principle is super good in a hands of newbie programmers and extremely dangerous in experienced hands.
    With DRY principle its good to know when to stop. Code with DRY overused can harm scalability a lot. 
    Using Model Framework you might feel are you doing too much duplication - but don't worry - 
    every duplication we assume to have is made to prevent other much bigger issues.
    This duplication is a small price for the benefits we would have.  

* what about OOP?

    We are strong OOP users, but maybe not in the way you have always written. 
    The most important thing to understand is that OOP isn't about using classes.
    It's about designing your objects. If in previous language you loved to use `class`, 
    here with the approaches this framework suggests you'll have many different problems with using `class`-es. 
    This framework is not trying to use approaches you are used to - simply because these approaches 
    are going to lead to same issues that wouldn't be possible to resolve.
    We are trying to provide you a different approach that solves these issues using modern language features 
    and at the same time keeping in mind all best practices we had in past.
    
* encapsulation

    Encapsulation doesn't always mean using `private` keyword. 
    Encapsulation is about separation of your public and private.
    In JavaScript / TypeScript there are many ways how to do that other than using `private` keyword on a class. 
    
* inheritance

    Inheritance doesn't always mean using `extends` keyword.
    In JavaScript / TypeScript you are able to use much more powerful and at the same time more simpler 
    object spread syntax and gain more more benefits over classic class extension. 
    

## Basic model example

Let's take a look on a basic model declaration:

```ts
type User = {
    id: number
    firstName: string
    lastName: string
    age: number
}
```

And actual usage can look this way:

```ts
const user: User = {
    id: 1,
    firstName: "Timber",
    lastName: "Saw",
    age: 25
}
```

By having a strictly defined models it will be easier for you and your team to develop and maintain the application.

## Type-safe models in a real world use cases 

Next, you manipulate with model in your application.
Any application based on a domain driven design.
And its all what your application represents.

## What is model framework?

Model framework allows is a set of tools that help you to use models in your apps the most effecient way.
It's opinionated, but every opinion is based on the best practices working with models in different scenarios. 
And also, model framework is designed for usage in cross-platform applications 
with shared logic between your backend frontend or any other environment.

## Model declaration

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

## TODOs

* fix issues with null and undefined
* implement subscriptions
* model subscriptions
* implement uploading
* implement custom scalars
* implement logger
* implement date type
* add error handling
* implement selection aliasing
* think about exported selection queries (to make restricted queries from server)
//       take a note that there are can be multiple clients (including microservices) that can send queries
//       also have in mind about parameters, most likely parameters for such queries will be argument based
* implement root aggregated queries
* implement __typename?
* what about fragments? (looks like they are just same models we have? but for selection? can we just use rest/spread syntax?)
* what about graphql enums?
* graphql union types?
* extract fetch parameter out of fetch method, e.g. make it app.query("post", {...}).fetch(), see aggregate example
