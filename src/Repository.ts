'use strict';

import {DynamoDB, QueryCommandInput, QueryCommandOutput} from '@aws-sdk/client-dynamodb';

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
        private readonly outputMapper: QueryCommandOutputMapper<T>,
    ) {
    }

    protected async query(
        query: QueryCommandInput,
    ): Promise<Collection<T>> {
        const label: string = JSON.stringify(query);

        console.time(label);

        return new Promise((
            resolve: (value: Collection<T>) => void,
        ): void => {
            this.db.query(query, (error: any, data?: QueryCommandOutput): void => {
                console.timeEnd(label);

                const result: Collection<T> = Collection.create<T>();

                if (error) {
                    console.error('Error while running query:', error);
                    return resolve(result);
                }

                (data?.Items ?? []).forEach(item => {
                    result.push(this.outputMapper.map(item))
                });

                result.LastEvaluatedKey = data?.LastEvaluatedKey;

                resolve(result);
            });
        });
    }

}
