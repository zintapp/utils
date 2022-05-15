import { Observable, OperatorFunction, pipe } from "rxjs";
import { Buffer } from 'buffer';

import { map, toArray, scan, mergeMap } from "rxjs/operators"


export function waitForAllData(): OperatorFunction<Buffer, Buffer>
{ 
    return pipe(
        map(x => Buffer.from(x)),
        toArray(),
        map((bufferList: Buffer[]) => Buffer.concat(bufferList))
    )
}

export function decode(encoding: string): OperatorFunction<Buffer, string> {
    return map((o: Buffer) => Buffer.from(o).toString(encoding));
}

interface LineSplits {
    unfinish: string
    lines: string[]
}
function pluckLines() {
    return function(source: Observable<LineSplits>): Observable<string[]> {
      return new Observable(subscriber => {
        let lastVal: string;
        source.subscribe({
          next(value) {
            lastVal = value.unfinish
            subscriber.next(value.lines);
          },
          error(error) {
            subscriber.error(error);
          },
          complete() {
            subscriber.next([lastVal]);
            subscriber.complete();
          }
        })
      });
    }
  }
  

export function splitByRegex(rex: RegExp): OperatorFunction<string, string> {
    return pipe(
        scan( ({unfinish, lines}, chunk) => {
            const newAcc = unfinish + chunk
            const newlines = newAcc.split(rex)
            return {unfinish: newlines[newlines.length-1], lines: newlines.slice(0,newlines.length-1)}
        }, {unfinish: '', lines: [] as string[]}),
        pluckLines(),
        mergeMap(x=>x)
    )
}

export const splitByLines = () => splitByRegex(/\r?\n/)