import { OperatorFunction, pipe } from "rxjs";
import { Buffer } from 'buffer';

import { reduce, map } from "rxjs/operators"


export function waitForAllData(): OperatorFunction<Buffer, Buffer>
{
    const reduceToListOfBuffers =
        reduce(
            (acc: Buffer[], chunk: Buffer) => {
                acc.push(chunk);
                return acc;
            }, []);
    
    return pipe(
        reduceToListOfBuffers,
        map((bufferList: Buffer[]) => Buffer.concat(bufferList))
    )
}
