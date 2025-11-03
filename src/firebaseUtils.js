// firebaseUtils.js
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove  } from 'firebase/firestore';
import { db } from './firebase';

export async function createUserDocument(user) {
    const userRef = doc(db, 'users', user.uid);

    await setDoc(userRef, {
        email: user.email,
        savedMovies: [],
        savedFoods: []
    }, { merge: true });
}

export async function addMovieToFavorites(userId, movie) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        savedMovies: arrayUnion(movie)
    });
}  

export async function removeMovieFromFavorites(userId, movie) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        savedMovies: arrayRemove(movie)
    });
}  

export async function addRecipeToFavorites(userId, recipe) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        savedFoods: arrayUnion(recipe)
    });
}

export async function removeRecipeFromFavorites(userId, recipe) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
    savedFoods: arrayRemove(recipe)
    });
}