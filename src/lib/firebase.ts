import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let firebaseInitialized = false;

// Tenta obter a configuração do Firebase
const configFromGlobal = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const configFromEnv = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Decide qual configuração usar. Dá prioridade à global (produção/Canvas).
const finalConfig = configFromGlobal.apiKey ? configFromGlobal : configFromEnv;

try {
  // Verifica se a configuração final tem as chaves necessárias.
  if (finalConfig.apiKey && finalConfig.projectId) {
    app = initializeApp(finalConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseInitialized = true;
  } else {
    // Apenas lança o erro se nenhuma configuração for encontrada.
    throw new Error("A configuração do Firebase não foi encontrada. Verifique o seu ficheiro .env ou as variáveis de ambiente de produção.");
  }
} catch (error) {
  console.error("FALHA NA INICIALIZAÇÃO DO FIREBASE:", error);
  // Objetos "dummy" para evitar que a aplicação quebre.
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
}

export { app, auth, db, firebaseInitialized };
