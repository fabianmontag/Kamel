import { useEffect, useState } from "react";

const getCodeFromParams = (): string | null => {
    const params = new URLSearchParams(document.location.search);
    const code = params.get("code");
    if (!code) return null;
    else return atob(code);
};

export const useCode = (initalCode: string): [string, (s: string) => void] => {
    const [code, setCode] = useState<string>(getCodeFromParams() ?? localStorage.getItem("code") ?? initalCode);

    // update localStorage on code update
    useEffect(() => {
        localStorage.setItem("code", code);
    }, [code]);

    return [code, setCode];
};
