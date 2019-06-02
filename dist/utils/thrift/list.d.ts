import { IBaseType } from './ibase-type';
import { StructFieldType } from './struct';
export declare class List implements IBaseType {
    elementType: StructFieldType;
    elements: IBaseType[];
    constructor(elements: IBaseType[], elementType: StructFieldType);
    writeToBuffer(buf: ArrayBuffer, byteOffset: number): number;
    calculateByteLength(): number;
}
export default List;
