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
        {
            item: {
                identifier: 'CamelCase|01af80d4-8030-494d-b017-e907b4760a49',
            },
            key: 'identifier',
            expectedId: '01af80d4-8030-494d-b017-e907b4760a49',
            expectedObject: 'camel_case',
        },
        {
            item: {
                id: 'SOMETHINGElse|1234567890',
            },
            key: 'id',
            expectedId: '1234567890',
            expectedObject: 'something_else',
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
