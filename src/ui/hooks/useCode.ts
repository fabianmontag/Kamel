import { useEffect, useState } from "react"

export const useCode = (initalCode: string): [string, React.Dispatch<React.SetStateAction<string>>] => {
    const [code, setCode] = useState(localStorage.getItem("code") ?? initalCode);

    // update localStorage on code update
    useEffect(() => {
        localStorage.setItem("code", code);
    }, [code]);

    return [code, setCode];
}