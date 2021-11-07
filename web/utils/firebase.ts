import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

let firebaseConfig = {
    apiKey: "AIzaSyBN_lTMARMUO4IZ5H6FUU1An8V4nigp6Pk",
    authDomain: "kotaru-5472c.firebaseapp.com",
    projectId: "kotaru-5472c",
    storageBucket: "kotaru-5472c.appspot.com",
    messagingSenderId: "122672585386",
    appId: "1:122672585386:web:83fd8c9d94c68f56bc0ed3"
};

let app

if(!firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
}

let db = firebase.firestore();

export {
    db
}
// export default app