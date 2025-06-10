import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { onAuthStateChanged, Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  return new Promise<boolean>((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(true);
      } else {
        window.location.href = '';
        resolve(false);
      }
    });
  });
};
