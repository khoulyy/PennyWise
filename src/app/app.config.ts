import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"pennywise-7b083","appId":"1:1002604848294:web:1b7d33cc53ba3e0368c067","storageBucket":"pennywise-7b083.firebasestorage.app","apiKey":"AIzaSyBdLx1ph28DqbzwZQRWN25n71jTXqQmpS8","authDomain":"pennywise-7b083.firebaseapp.com","messagingSenderId":"1002604848294","measurementId":"G-6CD7GV47WV"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
