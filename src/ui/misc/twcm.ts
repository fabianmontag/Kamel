import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// tailwind class merge
// helper function to conditionally add tw classes, merges classes together
export const twcm = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};
