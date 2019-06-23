import firebase from 'firebase';
import db from '../config/firebase';
import { orderBy, groupBy, values } from 'lodash'
import { allowNotifications, sendNotification } from './'

export const updateEmail = (email) => {
    return {type: 'UPDATE_EMAIL', payload: email}
}

export const updatePassword = (password) => {
    return {type: 'UPDATE_PASSWORD', payload: password}
}

export const updateUserName = (username) => {
    return {type: 'UPDATE_USERNAME', payload: username}
}

export const updateGender = (gender) => {
    return {type: 'UPDATE_GENDER', payload: gender}
}

export const updateAge = (age) => {
    return {type: 'UPDATE_AGE', payload: age}
}

export const updatePhoto = (photo) => {
	return {type: 'UPDATE_PHOTO', payload: photo}
}

export const login = () => {
	return async (dispatch, getState) => {
		try {
			const { email, password } = getState().user
			const response = await firebase.auth().signInWithEmailAndPassword(email, password)
			dispatch(getUser(response.user.uid))
			dispatch(allowNotifications())
		} catch (e) {
			alert(e)
		}
	}
}

export const facebookLogin = () => {
	return async (dispatch) => {
		try {
			const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync('304682660450298')
			if(type === 'success') {
				// Build Firebase credential with the Facebook access token.
				const credential = await firebase.auth.FacebookAuthProvider.credential(token);
				// Sign in with credential from the Facebook user.
				const response = await firebase.auth().signInWithCredential(credential)
				const user = await db.collection('users').doc(response.uid).get()
				if(!user.exists){
					const user = {
						uid: response.uid,
						email: response.email,
						username: response.displayName,
                        age: '',
                        gender: '',
                        photo: response.photoURL,
                        location: [],
                        promos: [],
						token: null,
					}
					db.collection('users').doc(response.uid).set(user)
					dispatch({type: 'LOGIN', payload: user})
				} else {
					dispatch(getUser(response.uid))
				}
			}
		} catch (e) {
			alert(e)
		}
	}
}

export const getUser = (uid, type) => {
	return async (dispatch, getState) => {
		try {
			const userQuery = await db.collection('users').doc(uid).get()
			let user = userQuery.data()

      let posts = []
      const postsQuery = await db.collection('posts').where('uid', '==', uid).get()
      postsQuery.forEach(function(response) {
        posts.push(response.data())
      })
      user.posts = orderBy(posts, 'date','desc')

			if(type === 'LOGIN'){
				dispatch({type: 'LOGIN', payload: user })
			} else {
				dispatch({type: 'GET_PROFILE', payload: user })
			}
		} catch (e) {
			alert(e)
		}
	}
}

export const updateUser = () => {
    return async ( dispatch, getState )  => {
      const { uid, username, age, gender, photo } = getState().user
      try {
        db.collection('users').doc(uid).update({
          username: username,
          age: age,
          gender: gender,
          photo: photo
        })
      } catch(e) {
        alert(e)
      }
    }
  }

export const signup = () =>{
    return async (dispatch, getState) => {
    try{
        const {email, password, username, age, gender} = getState().user
        const response = await firebase.auth().createUserWithEmailAndPassword(email, password)
        console.log('>>> response: ' + response)
        //create a new user object with the state input from the Text fields and uid from firebase authentication method
        if(response.user.uid){
        const user = {
            uid: response.user.uid,
            email: email,
            username: username,
            photo: '',
            age: age,
            gender: gender,
            location: [],
            promos: [],
            token: null,

        }
        //stores the user information on firestore database and use uid created by firebase authentication
        db.collection('users').doc(response.user.uid).set(user)

        dispatch({type: 'LOGIN', payload: user}) //dispatch the new user object insted of firebase object for global redux state handler
    }
    } catch(e){
        alert(e)
    }
    } 
}