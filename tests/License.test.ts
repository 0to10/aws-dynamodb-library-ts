'use strict';

import path from 'path';

import {init, InitOpts, ModuleInfos} from 'license-checker-rseidelsohn';

// @ts-ignore
import {describe, expect, test} from '@jest/globals';


describe('Licenses', (): void => {

    const retrieveLicenses = async (directory: string): Promise<ModuleInfos> => {
        const options: InitOpts = {
            start: directory,
            production: true,

            /**
             * Exclude "valid" licenses from the output
             */
            excludeLicenses: [
                'Apache-2.0',
                'BSD-3-Clause',
                'ISC',
                'MIT',
            ].join(','),
        };

        return new Promise((resolve, reject): void => {
            init(options, (error, packages): void => {
                if (error) {
                    return reject(error);
                }

                resolve(packages);
            });
        })
    };

    test('valid licenses', async (): Promise<void> => {
        const licenses: ModuleInfos = await retrieveLicenses(
            path.resolve(__dirname, '../')
        );

        expect(Object.keys(licenses).length).toStrictEqual(0);
    });

});
