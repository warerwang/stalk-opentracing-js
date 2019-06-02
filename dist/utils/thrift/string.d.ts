import { IBaseType } from './ibase-type';
export declare class String implements IBaseType {
    value: string;
    constructor(value: string);
    writeToBuffer(buf: ArrayBuffer, byteOffset: number): number;
    calculateByteLength(): number;
}
export declare function toUTF8Array(str: string): number[];
export default String;
