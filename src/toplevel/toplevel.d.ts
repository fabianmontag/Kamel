// toplevel.d.ts
declare global {
    interface Toplevel {
        setup(cb: (e: HTMLElement) => void): (c: string, o: HTMLElement) => boolean;
        reset(): void;
    }

    const toplevel: Toplevel;
}

export {};
