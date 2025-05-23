import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User,
  } from "firebase/auth"
  import { doc, getDoc, setDoc , getDocs , collection ,query ,where , getFirestore} from "firebase/firestore"
  import { db } from "./firebase"

  
  const auth = getAuth()
  
  export const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      if (userCredential.user.email) {
        const adminRef = collection(db, "admin_id")
        const q = query(adminRef, where("email", "==", userCredential.user.email))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          alert("Welcome Admin")
          return { user: userCredential.user, error: null }
        } else {
          await signOut()
          alert("You are not an admin")
          return { user: null, error: "Login Failed" }
        }
        }
      }

    catch (error: any) {
      await signOut()
      return { user: null, error: error.message }
    }
  }
  
  export const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  
      // Create user document in Firestore
      await setDoc(doc(db, "user_id", userCredential.user.uid), {
        name,
        email,
        firebase_uid: userCredential.user.uid,
        createdAt: new Date(),
        update_at: new Date(),
        user_point: 0,
        department_id: "",
      })
  
      return { user: userCredential.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }
  
  export const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }
  
  export const getCurrentUser = (): Promise<User | null> => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()
        resolve(user)
      })
    })
  }
  
  export const getUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "user_id", userId))
      if (userDoc.exists()) {
        return { userData: userDoc.data(), error: null }
      } else {
        return { userData: null, error: "User not found" }
      }
    } catch (error: any) {
      return { userData: null, error: error.message }
    }
  }

  export const checkAdmin = async (email: string) => {
    try {
      const userDoc = await getDoc(doc(db, "admin_id", email))
      if (userDoc.exists()) {
        return { isAdmin: true, error: null }
      } else {
        return { isAdmin: false, error: null }
      }
    } catch (error: any) {
      return { isAdmin: false, error: error.message }
    }
  }
  
  