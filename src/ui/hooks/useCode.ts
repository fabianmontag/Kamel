import { useEffect, useState } from "react";
import { getCodeFromParams } from "../misc/shareURI";

export const useCode = (initalCode: string): [string, (s: string) => void] => {
    const [code, setCode] = useState<string>(getCodeFromParams() ?? localStorage.getItem("code") ?? initalCode);

    // update localStorage on code update
    useEffect(() => {
        localStorage.setItem("code", code);
    }, [code]);

    return [code, setCode];
};
