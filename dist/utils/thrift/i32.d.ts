import { IBaseType } from './ibase-type';
export declare class I32 implements IBaseType {
    value: number;
    constructor(value: number);
    writeToBuffer(buf: ArrayBuffer, byteOffset: number): number;
    calculateByteLength(): number;
}
export default I32;
