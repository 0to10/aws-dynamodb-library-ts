'use strict';

// @ts-ignore
import {describe, expect, test} from '@jest/globals';

import {QueryCommandOutputMapper} from '../../src/Query';
import {AttributeValue} from '@aws-sdk/client-dynamodb';

class StubQueryCommandOutputMapper extends QueryCommandOutputMapper<any> {
    public map(item: Record<string, AttributeValue>): Record<string, any> {
        return this.unmarshall(item);
    }
}


describe('QueryCommandOutputMapper', (): void => {

    const mapper: QueryCommandOutputMapper<any> = new StubQueryCommandOutputMapper();

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
