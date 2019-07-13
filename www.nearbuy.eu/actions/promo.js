import firebase from 'firebase'
import db from '../config/firebase'
import uuid from 'uuid'


export const uploadPromo = () =>{
    return async (dispatch, getState) => {
        try{
            const { promo, store } = getState()
            const id = uuid.v4()
            const upload = {
                promoId: id,
                uid: store.uid,
                photo: store.photo || ' ',
                storename: store.username,
                promoDescription: promo.description || ' ',
                promoPhoto: promo.photo,
                promoLocation: promo.location || ' ',
                category: promo.category,
                subcategory: promo.subcategory,
                gender: promo.gender,
                newPrice: promo.newPrice,
                oldPrice: promo.oldPrice,
                percentage: promo.percentage,
                title: promo.title    
            }

        db.collection('promos').doc(id).set(upload)
        
        } catch(e){
            console.error(e)
        }
    } 
}

