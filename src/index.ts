

import { Model, Document, Query } from 'mongoose';
import util from 'util';

const supportedOps = {
    count: true,
    findOne: true,
    find: true,
    findById: true,
};

const hashFunction = (query): string => {
    const {
        _mongooseOptions = {},
        _conditions = {},
        _fields = {},
        model,
        op,
    } = query;
    return `${model.modelName}|${op}|${JSON.stringify(_mongooseOptions)}|${JSON.stringify(_conditions)}|${JSON.stringify(_fields)}`;
};

export interface IOptions {
    /**
     * Time to live in milliseconds.
     * Default is unlimited.
     */
    ttl?: number;
}

export default <T extends Document = Document, M extends Model<T> = Model<T>>(Instance: M, options: IOptions = {}) => {
    const {
        ttl,
    } = options;

    const map = new Map<string, Promise<any>>();

    const queryHandler: ProxyHandler<Query<any>> = {
        get(target, propKey, receiver) {
            if (propKey === 'prototype') {
                const origMethod = target[propKey];
                return new Proxy(origMethod, queryHandler);
            }
    
            if (propKey === 'exec') {
                const key = hashFunction(receiver);
                if (!supportedOps[receiver.op]) {
                    return target[propKey];
                }
                // console.log('Executing .exec', key);
    
                if (map.has(key)) {
                    // console.log('@mmc - resolving from cache.');
                    return function(...args) {
                        const promsieResult = map.get(key);
                        if (args.length > 0) {
                            const [ callback ] = args;
                            util.callbackify(() => promsieResult)(callback);
                            return;
                        }
                        return promsieResult;
                    };
                }
    
                return function(...args) {
                    const execution: Promise<any> = target[propKey].apply(this);
                    map.set(key, execution);

                    if (ttl != null) {
                        setTimeout(() => {
                            map.delete(key);
                        }, ttl);
                    }

                    if (args.length > 0) {
                        const [ callback ] = args;
                        util.callbackify(() => execution)(callback);
                    } else {
                        return execution;
                    }
                };
            }
            return target[propKey];
        }
    };
    
    const handler: ProxyHandler<M> = {
        get(target, propKey) {
            const origMethod = target[propKey];
            if (propKey === 'Query') {
                return new Proxy(target[propKey], queryHandler);
            }
            return origMethod;
        }
    };
    
    return new Proxy(Instance, handler);
};
