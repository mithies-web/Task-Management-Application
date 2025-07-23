@@ .. @@
 export const environment = {
-  production: true,
+  production: false,
   maxLoginAttempts: 5,
   accountLockDuration: 15 * 60 * 1000,
-  apiUrl: 'https://your-production-api.com/api'
+  apiUrl: 'http://localhost:5000/api'
 };