import { IBaseType } from './ibase-type';
export declare class I64 implements IBaseType {
    value: number;
    constructor(value: number | BigInt | string);
    writeToBuffer(buf: ArrayBuffer, byteOffset: number): number;
    calculateByteLength(): number;
    toJSON(): string;
}
export default I64;
