

import { Model, Document, Query } from 'mongoose';

const hashFunction = (query) => {
    const {
        _mongooseOptions = {},
        _conditions = {},
        _fields = {},
        model,
        op,
    } = query;
    return `${model.modelName}|${op}|${JSON.stringify(_mongooseOptions)}|${JSON.stringify(_conditions)}|${JSON.stringify(_fields)}`
}

export default (Instance: Model<Document>, options = {}) => {

    const map = new Map<string, Promise<any>>();

    const queryHandler: ProxyHandler<Query<any>> = {
        get(target, propKey, receiver) {
            if (propKey === 'prototype') {
                const origMethod = target[propKey];
                return new Proxy(origMethod, queryHandler);
            }
    
            if (propKey === 'exec') {
                const key = hashFunction(receiver);
                console.log('Executing .exec', key);
    
                if (map.has(key)) {
                    console.log('Returning from Cache!');
                    return function() {
                        return map.get(key);
                    }
                }
    
                return function (...args) {
                    const execution = target[propKey].apply(this, args)
                    map.set(key, execution);
                    return execution;
                }
            }
            return target[propKey];
        }
    }
    
    const handler: ProxyHandler<Model<Document>> = {
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
