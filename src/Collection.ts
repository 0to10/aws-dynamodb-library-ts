'use strict';

import {AttributeValue} from '@aws-sdk/client-dynamodb';


/**
 * Collection
 *
 * @copyright Copyright (c) 2025 0TO10 B.V. <https://0to10.nl>
 * @license MIT
 */
export class Collection<T> extends Array<T> {

    public LastEvaluatedKey?: Record<string, AttributeValue> = undefined;

    private constructor(
        items: Array<T>,
    ) {
        super();

        Object.setPrototypeOf(this, Object.create(Array.prototype));

        items && items.forEach(item => {
            this.push(item);
        });
    }

    public static create<T>(
        items?: Array<T>,
    ): Collection<T> {
        return new Collection<T>(items || []);
    }

}
