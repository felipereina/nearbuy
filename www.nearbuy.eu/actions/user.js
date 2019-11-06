import firebase from "firebase";
import db from "../config/firebase";
import { orderBy } from "lodash";
import * as Facebook from "expo-facebook";

export const updateEmail = email => {
  return { type: "UPDATE_EMAIL", payload: email };
};

export const updatePassword = password => {
  return { type: "UPDATE_PASSWORD", payload: password };
};

export const updateUserName = username => {
  return { type: "UPDATE_USERNAME", payload: username };
};

export const updateGender = gender => {
  return { type: "UPDATE_GENDER", payload: gender };
};

export const updateAge = age => {
  return { type: "UPDATE_AGE", payload: age };
};

export const updatePhoto = photo => {
  return { type: "UPDATE_PHOTO", payload: photo };
};



export const login = () => {
  return async (dispatch, getState) => {
    try {
      const { email, password } = getState().user;
      const response = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
      dispatch(getUser(response.user.uid));
      //dispatch(allowNotifications())
    } catch (e) {
      console.error(e)
    }
  };
};

export const facebookLogin = () => {
  return async dispatch => {
    try {
      const { type, token } = await Facebook.logInWithReadPermissionsAsync(
        "1350015958483794",
        { permissions: ["public_profile"] }
      );

      if (type === "success") {
        // Build Firebase credential with the Facebook access token.
        const credential = await firebase.auth.FacebookAuthProvider.credential(
          token
        );

        // Sign in with credential from the Facebook user.
        let response = "";
        firebase
          .auth()
          .signInWithCredential(credential)
          .then(answer => {
            response = answer;
            db.collection("users")
              .doc(response.user.uid)
              .get()
              .then(user => {
                if (!user.exists) {
                  const user = {
                    uid: response.user.uid,
                    email: response.user.email,
                    username: response.user.displayName,
                    age: "",
                    gender: "",
                    photo: response.user.photoURL,
                    location: [],
                    promos: [],
                    token: null,
                    followers: [],
                    following: []
                  };
                  db.collection("users")
                    .doc(response.user.uid)
                    .set(user)
                    .then(() => {
                      dispatch({ type: "LOGIN", payload: user });
                    });
                } else {
                  dispatch(getUser(response.user.uid));
                }
              });
          })
          .catch(err => {
            console.error("User signin error", err);
          });
      }
    } catch (e) {
      console.error(e)
    }
  };
};

export const getUser = (uid, type) => {
  return async (dispatch) => {
    try {
      db.collection("users")
        .doc(uid)
        .get()
        .then(userQuery => {
          let user = userQuery.data();
          let posts = [];
          db.collection("post")
            .where("uid", "==", uid)
            .get()
            .then(postsQuery => {
              postsQuery.forEach(function (response) {
                posts.push(response.data());
              });

              user.posts = orderBy(posts, "date", "desc");

              if (type === "LOGIN") {
                dispatch({ type: "LOGIN", payload: user });
              } else {
                dispatch({ type: "GET_PROFILE", payload: user });
              }
            });
        });
    } catch (e) {
      console.error(e)
    }
  };
};

export const updateUser = () => {
  return async (getState) => {
    const { uid, username, age, gender, photo } = getState().user;
    try {
      db.collection("users")
        .doc(uid)
        .update({
          username: username,
          age: age,
          gender: gender,
          photo: photo
        });
    } catch (e) {
      console.error(e)
    }
  };
};

export const signup = () => {
  return async (dispatch, getState) => {
    try {
      const { email, password, username, age, gender, photo } = getState().user;
      const response = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);

      //create a new user object with the state input from the Text fields and uid from firebase authentication method
      if (response.user.uid) {
        const user = {
          uid: response.user.uid,
          email: email,
          username: username,
          photo: photo,
          age: age,
          gender: gender,
          location: [],
          promos: [],
          token: null,
          followers: [],
          following: []
        };
        //stores the user information on firestore database and use uid created by firebase authentication
        db.collection("users")
          .doc(response.user.uid)
          .set(user);

        dispatch({ type: "LOGIN", payload: user }); //dispatch the new user object insted of firebase object for global redux state handler
      }
    } catch (e) {
      console.error(e)
    }
  };
};

export const likePromo = (promoId) => {
  return async (dispatch, getState) => {
    const { uid, likePromos } = getState().user
    try {
      let newPromo = true
      if (likePromos) likePromos.forEach(promo => {
        if (promo == promoId) newPromo = false
      })

      if (newPromo) {
        await db.collection("users")
          .doc(uid)
          .update({
            likePromos: firebase.firestore.FieldValue.arrayUnion(promoId)
          })

        db.collection("users").doc(uid).get()
          .then(userQuery => {
            let user = userQuery.data();
            dispatch({ type: "UPDATE_LIKES", payload: user.likePromos })
          })
      }

    } catch (e) {
      console.error(e)
    }
  }
}

export const actualizeLocation = (
  location,
  country,
  district,
  conselho,
  freguesia
) => {
  return async (dispatch, getState) => {
    const { uid } = getState().user;
    let place = {
      country: country,
      district: district,
      conselho: conselho,
      freguesia: freguesia
    }
    try {
      if(uid){
      await db.collection("users")
        .doc(uid)
        .update({
          location: location,
          place: place
        });
        dispatch({type: "UPDATE_LOCATION", payload: location})
        dispatch({type: "UPDATE_PLACE", payload: place})
      }
    } catch (e) {
      console.error(e)
    }
  };
};
