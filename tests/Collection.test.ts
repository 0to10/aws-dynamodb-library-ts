'use strict';

// @ts-ignore
import {describe, expect, test} from '@jest/globals';

import {Collection} from '../src';


describe('Collection', (): void => {

    test('.create', (): void => {
        const collection: Collection<any> = Collection.create<any>();

        expect(collection).toBeInstanceOf(Array);
        expect(collection.length).toStrictEqual(0);

        expect(collection.LastEvaluatedKey).toBeUndefined();
    });

    test.each([
        {
            items: [],
            lastEvaluatedKey: undefined,
        },
        {
            items: [
                {
                    'first': 1,
                    'second': true,
                    'third': 'test',
                },
                {
                    'boolean': false,
                },
                {
                    'number': 99.7,
                },
            ],
            lastEvaluatedKey: {
                'key': { S: 'value' },
            },
        },
        {
            items: [
                {
                    'buffer': Buffer.alloc(10),
                },
                {
                    'test': 'something',
                },
            ],
            lastEvaluatedKey: undefined,
        },
    ])('.create($items)', ({items, lastEvaluatedKey}): void => {
        const collection: Collection<any> = Collection.create<any>(items);
        collection.LastEvaluatedKey = lastEvaluatedKey;

        expect(collection.length).toStrictEqual(items.length);
        expect(collection.LastEvaluatedKey).toStrictEqual(lastEvaluatedKey);

        for (let i = 0; i < items.length; i++) {
            expect(collection[i]).toStrictEqual(items[i]);
        }
    });

});
