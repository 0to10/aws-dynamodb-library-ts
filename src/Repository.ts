'use strict';

import {DynamoDB, QueryCommandInput, QueryCommandOutput, AttributeValue} from '@aws-sdk/client-dynamodb';
import {NativeAttributeValue, marshall} from '@aws-sdk/util-dynamodb';

import {Collection} from './Collection';
import {QueryCommandOutputMapper} from './Query';


/**
 * Repository
 *
 * @copyright Copyright (c) 2025 0TO10 B.V. <https://0to10.nl>
 * @license MIT
 */
export abstract class Repository<T> {

    protected constructor(
        private readonly db: DynamoDB,
        protected readonly tableName: string,
        protected readonly indexName: string | undefined,
        private readonly outputMapper: QueryCommandOutputMapper<T>,
    ) {
    }

    public async findBy(
        criteria: Record<string, NativeAttributeValue>,
        limit: number = 100,
    ): Promise<Collection<T>> {
        let keyConditionExpressionParts: string[] = [];

        let ExpressionAttributeNames: Record<string, string> = {};
        let ExpressionAttributeValues: Record<string, AttributeValue> = {};

        for (const criterion in criteria) {
            const index: number = keyConditionExpressionParts.length + 1;

            ExpressionAttributeNames[`#c${index}`] = criterion;

            let value: NativeAttributeValue = criteria[criterion];

            if (value.endsWith('*')) {
                value = value.substring(0, value.length - 1);
                keyConditionExpressionParts.push(`begins_with(#c${index}, :c${index})`);
            } else {
                keyConditionExpressionParts.push(`#c${index} = :c${index}`);
            }

            ExpressionAttributeValues[`:c${index}`] = marshall(value, {
                // TODO set `marshall` options
            });
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
        return this.findBy(
            criteria,
            1,
        ).then(result => result[0]);
    }

    protected async query(
        query: QueryCommandInput,
    ): Promise<Collection<T>> {
        const label: string = JSON.stringify(query);

        console.time(label);

        const result: Collection<T> = Collection.create<T>();

        return this.db.query(query, {}).then(
            (data: QueryCommandOutput): Collection<T> => {
                data.Items?.forEach(item => {
                    result.push(this.outputMapper.map(item))
                });

                result.LastEvaluatedKey = data.LastEvaluatedKey;

                return result;
            },
            (error: any): Collection<T> => {
                console.error('Error while running query:', error);
                return result;
            }
        );
    }

}
