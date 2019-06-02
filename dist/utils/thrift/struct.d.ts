import { IBaseType } from './ibase-type';
interface StructField {
    type: StructFieldType;
    id: number;
    name: string;
    value: IBaseType;
}
export declare class Struct implements IBaseType {
    fields: StructField[];
    constructor(fields: StructField[]);
    writeToBuffer(buf: ArrayBuffer, byteOffset: number): number;
    calculateByteLength(): number;
}
export default Struct;
export declare enum StructFieldType {
    BOOL = 2,
    BYTE = 3,
    DOUBLE = 4,
    I16 = 6,
    I32 = 8,
    I64 = 10,
    STRING = 11,
    STRUCT = 12,
    MAP = 13,
    SET = 14,
    LIST = 15
}
