import firebase from "firebase";
import db from "../config/firebase";
import { orderBy, groupBy, values } from "lodash";

export const updateStoreEmail = email => {
  return { type: "UPDATE_STORE_EMAIL", payload: email };
};

export const updateStorePassword = password => {
  return { type: "UPDATE_STORE_PASSWORD", payload: password };
};

export const updateStoreName = storename => {
  return { type: "UPDATE_STORE_NAME", payload: storename };
};

export const updateStorePhoto = photo => {
  return { type: "UPDATE_STORE_PHOTO", payload: photo };
};

export const loginStore = () => {
  return async (dispatch, getState) => {
    try {
      const { email, password } = getState().store;
      const response = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
      dispatch(getStore(response.user.uid));
    } catch (e) {
      alert(e);
    }
  };
};

export const getStore = (uid, type) => {
  return async (dispatch, getState) => {
    try {
      db.collection("stores")
        .doc(uid)
        .get()
        .then(storeQuery => {
          let store = storeQuery.data();
          let posts = [];
          db.collection("post")
            .where("uid", "==", uid)
            .get()
            .then(postsQuery => {
              postsQuery.forEach(function(response) {
                posts.push(response.data());
              });

              store.posts = orderBy(posts, "date", "desc");

              if (type === "LOGIN_STORE") {
                dispatch({ type: "LOGIN_STORE", payload: store });
              } else {
                dispatch({ type: "GET_STORE_PROFILE", payload: store });
              }
            });
        });
    } catch (e) {
      alert(e);
    }
  };
};

export const updateStore = () => {
  return async (dispatch, getState) => {
    const { uid, storename, photo } = getState().store;
    try {
      db.collection("stores")
        .doc(uid)
        .update({
          storename: storename,
          photo: photo
        });
    } catch (e) {
      alert(e);
    }
  };
};

export const signupStore = () => {
  return async (dispatch, getState) => {
    try {
      const { email, password, storename } = getState().store;
      const response = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);

      //create a new store object with the state input from the Text fields and uid from firebase authentication method
      if (response.user.uid) {
        const store = {
          uid: response.user.uid,
          email: email,
          storename: storename,
          photo: "",
          location: [],
          promos: [],
          token: null
        };
        //stores the store information on firestore database and use uid created by firebase authentication
        db.collection("stores")
          .doc(response.user.uid)
          .set(store);

        dispatch({ type: "LOGIN_STORE", payload: store }); //dispatch the new user object insted of firebase object for global redux state handler
      }
    } catch (e) {
      alert(e);
    }
  };
};


export const validateQRcode = (
  code
) => {
 

  return async (dispatch, getState, code) => {

     let user_id = code.split("/")[1];

    try {
      db.collection("users")
        .doc(user_id)
        .update({
          purchases: admin.firestore.FieldValue.arrayUnion(code)
          }
        );
    } catch (e) {
      alert(e);
    }
  };

};






