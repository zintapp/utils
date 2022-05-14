import { OperatorFunction, pipe } from "rxjs";
import { Buffer } from 'buffer';

import { map, toArray, scan, pluck, mergeMap } from "rxjs/operators"


export function waitForAllData(): OperatorFunction<Buffer, Buffer>
{ 
    return pipe(
        toArray(),
        map((bufferList: Buffer[]) => Buffer.concat(bufferList))
    )
}

export function decode(encoding: string): OperatorFunction<Buffer, string> {
    return map((o: Buffer) => o.toString(encoding));
}

export function splitByRegex(rex: RegExp): OperatorFunction<string, string> {
    return pipe(
        scan( ({unfinish, lines}, chunk) => {
            const newAcc = unfinish + chunk
            const newlines = newAcc.split(rex)
            return {unfinish: lines[lines.length-1], lines: newlines.slice(0,newlines.length-1)}
        }, {unfinish: '', lines: [] as string[]}),
        pluck('lines'),
        mergeMap(x=>x)
    )
}

export const splitByLines = () => splitByRegex(/\r?\n/)