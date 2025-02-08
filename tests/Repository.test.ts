'use strict';

// @ts-ignore
import {describe, expect, jest, test, beforeEach, afterAll} from '@jest/globals';

import {DynamoDB, QueryCommandInput, QueryCommandOutput} from '@aws-sdk/client-dynamodb';
import {HttpHandlerOptions} from '@smithy/types';

import {Repository, Collection} from '../src';
import {ReplacingQueryCommandOutputMapper} from '../src/Query';

jest.mock('@aws-sdk/client-dynamodb');

const repository = new class extends Repository<any> {
    constructor() {
        super(
            new DynamoDB(),
            'the-table-name',
            'the-index',
            new ReplacingQueryCommandOutputMapper(),
        );
    }
}


describe('Repository', (): void => {

    const ORIGINAL_CONSOLE: Console = console;

    beforeEach((): void => {
        jest.clearAllMocks();

        console = ORIGINAL_CONSOLE;
    });

    afterAll((): void => {
        console = ORIGINAL_CONSOLE;
    });

    test.each([
        {
            criteria: {
                something: 'bla',
            },
            expression: {
                keyCondition: '#c1 = :c1',
                attributeNames: {
                    '#c1': 'something',
                },
                attributeValues: {
                    ':c1': { S: 'bla' },
                },
            },
            expectedResult: Collection.create(),
        },
        {
            criteria: {
                wildcard_search: 'start-of-string*',
                exact: 'something',
            },
            expression: {
                keyCondition: 'begins_with(#c1, :c1) AND #c2 = :c2',
                attributeNames: {
                    '#c1': 'wildcard_search',
                    '#c2': 'exact',
                },
                attributeValues: {
                    ':c1': { S: 'start-of-string' },
                    ':c2': { S: 'something' },
                },
            },
            expectedResult: Collection.create(),
        },
    ])('.findBy($criteria)', async ({
        criteria,
        expression,
        expectedResult,
    }): Promise<void> => {
        jest.spyOn(DynamoDB.prototype, 'query').mockImplementation(
            async (_args: QueryCommandInput, _options: HttpHandlerOptions): Promise<QueryCommandOutput> => {
                return {
                    $metadata: {},
                    Items: [],
                    Count: undefined,
                    ScannedCount: undefined,
                    LastEvaluatedKey: undefined,
                    ConsumedCapacity: undefined,
                };
            }
        );

        const result: Collection<any> = await repository.findBy(
            criteria,
            100,
        );

        expect(result).toStrictEqual(expectedResult);

        expect(DynamoDB.prototype.query).toHaveBeenCalledTimes(1);
        expect(DynamoDB.prototype.query).toHaveBeenCalledWith({
            TableName: 'the-table-name',
            IndexName: 'the-index',

            KeyConditionExpression: expression.keyCondition,
            ExpressionAttributeNames: expression.attributeNames,
            ExpressionAttributeValues: expression.attributeValues,

            Limit: 100,
        }, {});
    });

    // TODO test `findOneBy`

    test('.findBy - query throws error', async (): Promise<void> => {
        console.error = (): void => {};

        const expectedError: Error = new Error('Something went wrong');

        jest.spyOn(DynamoDB.prototype, 'query').mockImplementation(
            async (_args: QueryCommandInput, _options: HttpHandlerOptions): Promise<QueryCommandOutput> => {
                throw expectedError;
            }
        );

        jest.spyOn(console, 'error');

        const result: Collection<any> = await repository.findBy(
            {},
            100,
        );

        expect(result).toStrictEqual(Collection.create());

        expect(DynamoDB.prototype.query).toHaveBeenCalledTimes(1);
        expect(DynamoDB.prototype.query).toHaveBeenCalledWith({
            TableName: 'the-table-name',
            IndexName: 'the-index',

            KeyConditionExpression: '',
            ExpressionAttributeNames: {},
            ExpressionAttributeValues: {},

            Limit: 100,
        }, {});

        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith('Error while running query:', expectedError);
    });

});
