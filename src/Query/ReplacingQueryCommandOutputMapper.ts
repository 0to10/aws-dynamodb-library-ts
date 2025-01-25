'use strict';

import {AttributeValue} from '@aws-sdk/client-dynamodb';
import {NativeAttributeValue} from '@aws-sdk/util-dynamodb';

import {QueryCommandOutputMapper} from './QueryCommandOutputMapper';
import {Replacer} from '../Replacer';


/**
 * ReplacingQueryCommandOutputMapper
 *
 * @copyright Copyright (c) 2025 0TO10 B.V. <https://0to10.nl>
 * @license MIT
 */
export class ReplacingQueryCommandOutputMapper extends QueryCommandOutputMapper<NativeAttributeValue> {

    constructor(
        private readonly replacers: { [key: string]: Replacer | undefined },
    ) {
        super();
    }

    public map(
        item: Record<string, AttributeValue>,
    ): Record<string, NativeAttributeValue> {
        let data: Record<string, NativeAttributeValue> = this.unmarshall(item);

        for (const key in this.replacers) {
            if (!this.replacers.hasOwnProperty(key)) {
                continue;
            }

            const replacer: Replacer | undefined = this.replacers[key];

            if ('function' === typeof replacer) {
                data = replacer(data, key);
            }

            delete data[key];
        }

        return data;
    }

}
