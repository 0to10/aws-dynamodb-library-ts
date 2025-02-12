'use strict';

// @ts-ignore
import {describe, expect, jest, test, beforeEach, afterEach} from '@jest/globals';

import {DynamoDB, QueryCommandInput, QueryCommandOutput} from '@aws-sdk/client-dynamodb';
import {marshall, NativeAttributeValue} from '@aws-sdk/util-dynamodb';
import {HttpHandlerOptions} from '@smithy/types';

import {Repository, Collection, ReplacingQueryCommandOutputMapper} from '../src';

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

    protected hydrate(item: Record<string, NativeAttributeValue>): any {
        return item;
    }
}


describe('Repository', (): void => {

    beforeEach((): void => {
        jest.clearAllMocks();

        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'timeEnd').mockImplementation(() => {});
    });

    afterEach((): void => {
        expect(console.timeEnd).toHaveBeenCalledTimes(1);
    });

    test.each([
        {
            criteria: {
                something: 'bla',
            },
            limit: 100,
            expression: {
                keyCondition: '#c1 = :c1',
                attributeNames: {
                    '#c1': 'something',
                },
                attributeValues: {
                    ':c1': { S: 'bla' },
                },
            },
            returnedItems: [],
            expectedResult: Collection.create(),
        },
        {
            criteria: {
                name: 'start-of-string*',
                exact: 'something',
            },
            limit: 100,
            expression: {
                keyCondition: 'begins_with(#c1, :c1) AND #c2 = :c2',
                attributeNames: {
                    '#c1': 'name',
                    '#c2': 'exact',
                },
                attributeValues: {
                    ':c1': { S: 'start-of-string' },
                    ':c2': { S: 'something' },
                },
            },
            returnedItems: [marshall({
                name: 'start-of-string-something123',
                exact: 'something',
            })],
            expectedResult: Collection.create([{
                name: 'start-of-string-something123',
                exact: 'something',
            }]),
        },
    ])('.findBy($criteria)', async ({
        criteria,
        limit,
        expression,
        returnedItems,
        expectedResult,
    }): Promise<void> => {
        jest.spyOn(DynamoDB.prototype, 'query').mockImplementation(
            async (
                _args: QueryCommandInput,
                _options: HttpHandlerOptions,
            ): Promise<QueryCommandOutput> => {
                return {
                    $metadata: {},
                    Items: returnedItems,
                    Count: undefined,
                    ScannedCount: undefined,
                    LastEvaluatedKey: undefined,
                    ConsumedCapacity: undefined,
                };
            }
        );

        const result: Collection<any> = await repository.findBy(criteria, limit);

        expect(result).toStrictEqual(expectedResult);

        expect(DynamoDB.prototype.query).toHaveBeenCalledTimes(1);
        expect(DynamoDB.prototype.query).toHaveBeenCalledWith({
            TableName: 'the-table-name',
            IndexName: 'the-index',

            KeyConditionExpression: expression.keyCondition,
            ExpressionAttributeNames: expression.attributeNames,
            ExpressionAttributeValues: expression.attributeValues,

            Limit: limit,
        }, {});
    });

    test('.findBy() with default limit', async (): Promise<void> => {
        jest.spyOn(DynamoDB.prototype, 'query').mockImplementation(
            async (
                _args: QueryCommandInput,
                _options: HttpHandlerOptions,
            ): Promise<QueryCommandOutput> => {
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

        const result: Collection<any> = await repository.findBy({
            test: 1,
        });

        expect(result).toStrictEqual(Collection.create());

        expect(DynamoDB.prototype.query).toHaveBeenCalledTimes(1);
        expect(DynamoDB.prototype.query).toHaveBeenCalledWith({
            TableName: 'the-table-name',
            IndexName: 'the-index',

            KeyConditionExpression: '#c1 = :c1',
            ExpressionAttributeNames: {
                '#c1': 'test',
            },
            ExpressionAttributeValues: {
                ':c1': { N: '1' },
            },

            Limit: 100,
        }, {});
    });

    test('.findBy() query throws error', async (): Promise<void> => {
        const expectedError: Error = new Error('Something went wrong');

        jest.spyOn(DynamoDB.prototype, 'query').mockImplementation(
            async (
                _args: QueryCommandInput,
                _options: HttpHandlerOptions,
            ): Promise<QueryCommandOutput> => {
                throw expectedError;
            }
        );

        const result: Collection<any> = await repository.findBy({}, 100);

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
            returnedItems: [],
            expectedResult: undefined,
        },
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
            returnedItems: [marshall({
                something: 'bla',
                number: 1,
                boolean: false,
            })],
            expectedResult: {
                something: 'bla',
                number: 1,
                boolean: false,
            },
        },
    ])('.findOneBy($criteria)', async ({
        criteria,
        expression,
        returnedItems,
        expectedResult,
    }): Promise<void> => {
        jest.spyOn(DynamoDB.prototype, 'query').mockImplementation(
            async (
                _args: QueryCommandInput,
                _options: HttpHandlerOptions,
            ): Promise<QueryCommandOutput> => {
                return {
                    $metadata: {},
                    Items: returnedItems,
                    Count: undefined,
                    ScannedCount: undefined,
                    LastEvaluatedKey: undefined,
                    ConsumedCapacity: undefined,
                };
            }
        );

        const result: Collection<any> = await repository.findOneBy(criteria);

        expect(result).toStrictEqual(expectedResult);

        expect(DynamoDB.prototype.query).toHaveBeenCalledTimes(1);
        expect(DynamoDB.prototype.query).toHaveBeenCalledWith({
            TableName: 'the-table-name',
            IndexName: 'the-index',

            KeyConditionExpression: expression.keyCondition,
            ExpressionAttributeNames: expression.attributeNames,
            ExpressionAttributeValues: expression.attributeValues,

            Limit: 1,
        }, {});
    });

});
