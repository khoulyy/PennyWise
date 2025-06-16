import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { onAuthStateChanged, Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // If already authenticated and trying to access login (''), redirect to /home
        if (state.url === '' || state.url === '/') {
          router.navigate(['/home']);
          resolve(false);
        } else {
          resolve(true);
        }
      } else {
        // Not authenticated, allow access to login
        if (state.url === '/home') {
          router.navigate(['']);
          resolve(false);
        } else {
          resolve(true);
        }
      }
    });
  });
};
