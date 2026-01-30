import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomElement(arr: any[]) {
  const randomIndex = Math.floor(Math.random() * arr.length);

  return arr[randomIndex];
}
