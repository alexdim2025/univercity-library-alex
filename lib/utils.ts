import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0]) // get only first character of each word
    .join("")
    .toUpperCase()
    .slice(0, 2); // slice to onyl two characters