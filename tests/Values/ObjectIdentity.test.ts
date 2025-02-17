'use strict';

// @ts-ignore
import {describe, expect, test} from '@jest/globals';

import {ObjectIdentity, Replacer} from '../../src';


describe('ObjectIdentity', (): void => {

    test('.replacer', (): void => {
        const replacer: Replacer = ObjectIdentity.replacer;

        expect(replacer).toBeInstanceOf(Function);
    });

    test.each([
        {
            item: {
                some_key: '',
            },
            key: 'some_key',
            expectedId: undefined,
            expectedObject: '',
        },
        {
            item: {
                something: 'the_type|id',
            },
            key: 'not_set',
            expectedId: undefined,
            expectedObject: undefined,
        },
        {
            item: {
                hash: 'type|1234',
            },
            key: 'hash',
            expectedId: '1234',
            expectedObject: 'type',
        },
        {
            item: {
                without_id: 'just-a-type',
            },
            key: 'without_id',
            expectedId: undefined,
            expectedObject: 'just-a-type',
        },
    ])('.replacer($item)', ({
        item,
        key,
        expectedId,
        expectedObject,
    }): void => {
        const {id, object} = ObjectIdentity.replacer(item, key);

        expect(id).toStrictEqual(expectedId);
        expect(object).toStrictEqual(expectedObject);
    });

});
