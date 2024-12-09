import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// whenever we are passing large payload to server, we first have to stringify and then parse that value
export const parseStringy = (value: unknown) => {
  return JSON.parse(JSON.stringify(value));
};
