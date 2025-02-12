'use strict';

// @ts-ignore
import {describe, expect, test} from '@jest/globals';

import {AttributeValue} from '@aws-sdk/client-dynamodb';

import {QueryCommandOutputMapper} from '../../src/';

class StubQueryCommandOutputMapper extends QueryCommandOutputMapper {
    public map(item: Record<string, AttributeValue>): Record<string, any> {
        return this.unmarshall(item);
    }
}


describe('QueryCommandOutputMapper', (): void => {

    const mapper: QueryCommandOutputMapper = new StubQueryCommandOutputMapper();

    test.each([
        {
            item: {},
            expectedOutput: {},
        },
        {
            item: {
                test: { S: 'bla' }
            },
            expectedOutput: {
                test: 'bla',
            },
        },
    ])('.map($item)', async ({item, expectedOutput}): Promise<void> => {
        expect(mapper.map(item as any)).toStrictEqual(expectedOutput);
    });

});
