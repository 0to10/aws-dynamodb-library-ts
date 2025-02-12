'use strict';

import {DynamoDB, QueryCommandInput, QueryCommandOutput, AttributeValue} from '@aws-sdk/client-dynamodb';
import {NativeAttributeValue, marshallOptions, marshall} from '@aws-sdk/util-dynamodb';

import {Collection} from './Collection';
import {QueryCommandOutputMapper} from './Query';


/**
 * Repository
 *
 * @copyright Copyright (c) 2025 0TO10 B.V. <https://0to10.nl>
 * @license MIT
 */
export abstract class Repository<T> {

    private readonly marshallOptions: marshallOptions;

    protected constructor(
        private readonly db: DynamoDB,
        protected readonly tableName: string,
        protected readonly indexName: string | undefined,
        private readonly outputMapper: QueryCommandOutputMapper,
        marshallOptions: marshallOptions = {},
    ) {
        const defaultMarshallOptions: marshallOptions = {
            convertEmptyValues: false,
            removeUndefinedValues: false,
            convertClassInstanceToMap: true,
            convertTopLevelContainer: false,
        };

        this.marshallOptions = {...defaultMarshallOptions, ...marshallOptions};
    }

    public async findBy(
        criteria: Record<string, NativeAttributeValue>,
        limit: number = 100,
    ): Promise<Collection<T>> {
        let keyConditionExpressionParts: string[] = [];

        let ExpressionAttributeNames: Record<string, string> = {};
        let ExpressionAttributeValues: Record<string, AttributeValue> = {};

        for (const [criterion, value] of Object.entries(criteria)) {
            const index: number = keyConditionExpressionParts.length + 1;

            ExpressionAttributeNames[`#c${index}`] = criterion;

            if (
                'string' === typeof value
                && value.endsWith('*')
            ) {
                keyConditionExpressionParts.push(`begins_with(#c${index}, :c${index})`);

                const wildcardValue: string = value.substring(0, value.length - 1);
                ExpressionAttributeValues[`:c${index}`] = this.marshall(wildcardValue);

                continue;
            }

            keyConditionExpressionParts.push(`#c${index} = :c${index}`);
            ExpressionAttributeValues[`:c${index}`] = this.marshall(value);
        }

        return this.query({
            TableName: this.tableName,
            IndexName: this.indexName,

            KeyConditionExpression: keyConditionExpressionParts.join(' AND '),
            ExpressionAttributeNames,
            ExpressionAttributeValues,

            Limit: limit,
        });
    }

    public async findOneBy(
        criteria: Record<string, any>,
    ): Promise<T | undefined> {
        return this.findBy(criteria, 1).then(result => result[0]);
    }

    protected abstract hydrate(item: Record<string, NativeAttributeValue>): T;

    protected async query(
        query: QueryCommandInput,
    ): Promise<Collection<T>> {
        const label: string = JSON.stringify(query);

        console.time(label);

        const result: Collection<T> = Collection.create<T>();

        return this.db.query(query, {}).then(
            (data: QueryCommandOutput): Collection<T> => {
                console.timeEnd(label);

                data.Items?.forEach(item => {
                    const mapped: Record<string, NativeAttributeValue> = this.outputMapper.map(item);
                    const hydrated: T = this.hydrate(mapped);

                    result.push(hydrated);
                });

                result.LastEvaluatedKey = data.LastEvaluatedKey;

                return result;
            },
            (error: any): Collection<T> => {
                console.timeEnd(label);

                console.error('Error while running query:', error);
                return result;
            }
        );
    }

    private marshall(value: NativeAttributeValue): AttributeValue {
        return marshall(value, this.marshallOptions);
    }

}
