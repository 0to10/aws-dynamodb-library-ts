'use strict';

import {AttributeValue} from '@aws-sdk/client-dynamodb';
import {NativeAttributeValue, unmarshall} from '@aws-sdk/util-dynamodb';


/**
 * QueryCommandOutputMapper
 *
 * @copyright Copyright (c) 2025 0TO10 B.V. <https://0to10.nl>
 * @license MIT
 */
export abstract class QueryCommandOutputMapper {

    abstract map(item: Record<string, AttributeValue>): Record<string, NativeAttributeValue>;

    protected unmarshall(item: Record<string, AttributeValue>): Record<string, NativeAttributeValue> {
        return unmarshall(item, {
            wrapNumbers: false,
            convertWithoutMapWrapper: false,
        });
    }

}
