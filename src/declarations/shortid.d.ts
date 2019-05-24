declare module 'shortid' {
    export function generate(): string;
    export function characters(alphabet: string): string;
    export function isValid(id: string): boolean;
    export function seed(seed: number): void;
}
