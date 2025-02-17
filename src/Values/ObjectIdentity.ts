'use strict';

import {NativeAttributeValue} from '@aws-sdk/util-dynamodb';

import {Replacer} from '../Replacer';


/**
 * ObjectIdentity
 *
 * @copyright Copyright (c) 2025 0TO10 B.V. <https://0to10.nl>
 * @license MIT
 */
export class ObjectIdentity {

    public static replacer: Replacer = (
        item: Record<string, NativeAttributeValue>,
        key: string,
    ): Record<string, NativeAttributeValue> => {
        const value: any = item[key];

        if ('string' !== typeof value) {
            return item;
        }

        const identifiers: string[] = value.split('|');

        if ((identifiers.length - 1) > 0) {
            item.id = identifiers[identifiers.length - 1];
        }

        item.object = identifiers[0].replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();

        return item;
    };

}
