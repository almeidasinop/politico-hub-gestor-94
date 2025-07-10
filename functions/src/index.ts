import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Interface para definir a estrutura dos dados que a função espera receber
interface InviteUserData {
  newUserName: string;
  newUserEmail: string;
  gabineteId: string;
  role: 'admin' | 'assessor';
}

// CORREÇÃO: A assinatura da função foi atualizada para usar a estrutura de 'request'
// que contém tanto 'data' quanto 'auth', alinhando-se com as versões mais recentes
// da biblioteca firebase-functions.
export const inviteUser = functions.https.onCall(async (request: functions.https.CallableRequest<InviteUserData>) => {
  // 1. Verifica se o utilizador que está a fazer o pedido está autenticado.
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Apenas utilizadores autenticados podem adicionar membros.",
    );
  }

  // Os dados da aplicação agora vêm de 'request.data'
  const { newUserName, newUserEmail, gabineteId, role } = request.data;

  // 2. Obtém o perfil do utilizador que está a fazer o convite (o admin).
  const adminUid = request.auth.uid;
  const db = admin.firestore();
  const adminUserRef = db.collection("users").doc(adminUid);
  const adminDoc = await adminUserRef.get();

  if (!adminDoc.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      "Perfil do administrador não encontrado.",
    );
  }

  // 3. Verifica se o admin realmente pertence ao gabinete e se tem a função de 'admin'.
  const adminData = adminDoc.data();
  if (adminData?.gabineteId !== gabineteId || adminData?.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Você não tem permissão para adicionar membros a este gabinete.",
    );
  }

  try {
    // 4. Cria o novo utilizador no Firebase Authentication.
    const newUserRecord = await admin.auth().createUser({
      email: newUserEmail,
      emailVerified: false,
      password: "password123",
      displayName: newUserName,
      disabled: false,
    });

    // 5. Cria o perfil do novo utilizador no Firestore, ligando-o ao gabinete.
    await db.collection("users").doc(newUserRecord.uid).set({
      uid: newUserRecord.uid,
      name: newUserName,
      email: newUserEmail,
      gabineteId: gabineteId,
      role: role || "assessor",
    });

    return {
      success: true,
      message: `Utilizador ${newUserName} convidado com sucesso! A senha inicial é 'password123'.`,
    };
  } catch (error) {
    console.error("Erro ao criar novo utilizador:", error);
    if (error instanceof Error) {
      if ("code" in error && error.code === "auth/email-already-exists") {
        throw new functions.https.HttpsError(
          "already-exists",
          "Este email já está a ser utilizado.",
        );
      }
    }
    throw new functions.https.HttpsError(
      "internal",
      "Ocorreu um erro ao criar o novo utilizador.",
    );
  }
});
