'use strict';

import {NativeAttributeValue} from '@aws-sdk/util-dynamodb';


/**
 * Replacer
 *
 * @copyright Copyright (c) 2025 0TO10 B.V. <https://0to10.nl>
 * @license MIT
 */
export type Replacer<Input = NativeAttributeValue, Output = NativeAttributeValue> = (
    item: Record<string, Input>,
    key: string,
) => Record<string, Output>;
