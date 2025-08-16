import * as fflate from "fflate";

export const getCodeFromParams = (): string | null => {
    const params = new URLSearchParams(document.location.search);
    const encodedCode = params.get("code");

    if (!encodedCode) return null;

    try {
        const data = atob(decodeURIComponent(encodedCode));
        const buf2 = fflate.strToU8(data, true);
        const decompressedCodeBuf = fflate.decompressSync(buf2);
        const decompressedCode = fflate.strFromU8(decompressedCodeBuf, true);

        return decompressedCode;
    } catch (err) {
        return "";
    }
};

export const getURIDataFromCode = (code: string) => {
    try {
        const buf = fflate.strToU8(code, true);
        const compressed = fflate.compressSync(buf, { level: 9 });
        const encoded = encodeURIComponent(btoa(fflate.strFromU8(compressed, true)));
        return encoded;
    } catch (error) {
        return "";
    }
};
