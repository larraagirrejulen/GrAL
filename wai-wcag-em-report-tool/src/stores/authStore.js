import { writable } from 'svelte/store';

// Create a writable store with an initial value of false
export const isLoggedIn = writable(localStorage.getItem('isLoggedIn') === 'true');

export const loggedUser = writable(localStorage.getItem('loggedUser') || '');

export const loadedReport = writable(undefined);
