import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from 'axios';

axios.defaults.withCredentials = true;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
