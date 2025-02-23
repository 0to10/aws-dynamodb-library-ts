# AWS DynamoDB library

This repository provides a library to work with DynamoDB tables.


## Getting started

Get started quickly by following the instructions below.


### Installation

Use [NPM](https://www.npmjs.com/) to install this library into your project:

```shell
npm install --save @0to10/aws-dynamodb
```


### Basic usage

Implementing a repository is easy. Create a new class and extend the abstract `Repository` class
that the library exposes.

After implementing the abstract `hydrate` method you can start using the `findBy` and `findOneBy` methods
of the repository right away. No additional configuration or methods are needed.

The `findBy` and `findOneBy` methods both accept an object of criteria, where the key is the field that
is matched and the value is the value of the field. You may use a wildcard at the end of a value to perform
a "begins_with" search on the DynamoDB table.

The `findBy` method accepts a second argument to adjust the limit of the query.

```typescript
'use strict';

import {NativeAttributeValue} from '@aws-sdk/util-dynamodb';

import {Repository} from '@0to10/aws-dynamodb';

class EntityRepository extends Repository<Entity> {

    protected hydrate(item: Record<string, NativeAttributeValue>): Entity {
        return new Entity(item);
    }

}
```


### Additional methods

Any convenience methods may be added to the repository:

In the example below, two methods have been added: `findOneByName` and `findByName`. You may choose to
run a custom query by calling the protected `query` method or call any of the public methods.

```typescript
'use strict';

import {QueryCommandInput} from '@aws-sdk/client-dynamodb';
import {NativeAttributeValue} from '@aws-sdk/util-dynamodb';

import {Repository} from '@0to10/aws-dynamodb';

class EntityRepository extends Repository<Entity> {

    public async findOneByName(name: string): Promise<Entity> {
        const params: QueryCommandInput = {
            // Define your search params
        };

        return this.query(params);
    }

    public async findByName(name: string): Promise<Entity[]> {
        return this.findBy({
            name_field: name,
        });
    }

    protected hydrate(item: Record<string, NativeAttributeValue>): Entity {
        return new Entity(item);
    }

}
```


## Return values

When using and implementing a `Repository` class, please note:

* The `hydrate` method must always return a single hydrated document
* The `findOneBy` method will always return a single entity or `undefined` if no result was found
* The `findBy` method always returns an array of entities (which may be empty)

You may typehint for an Array-like return when using the `findBy` method, but be aware that the actual
return type is a `Collection` (which extends Array). The `Collection` class exposes a `LastEvaluatedKey`
variable with which you can run consecutive queries for when you need more results than the specified
limit.
