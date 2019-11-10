import React from "react";
import styles from "../../styles";
import firebase from "firebase";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator
} from "react-native";
import db from "../../config/firebase";
import { setCurrentPromo } from "../../actions/promo"


class Purchases extends React.Component {

    constructor() {
        super()
        this.state = {
            purchases: []
        }
    }

    componentDidMount = () => {
        //this.setState({purchases: this.props.user.purchases});

        this.getPurchases()
    };

    //blueprint 
    // componentDidMount() {
    //     this.getPurchases()
    // }
    
    getPurchases = () => {
        const {
            purchases
        } = this.props.user
        if (purchases) {
            purchases.forEach(purchaseUid => {
                let purchasePromoId = parseInt(purchaseUid.split("/")[3]);
                this.updatePurchases(purchasePromoId)
            })
        }
    }

    updatePurchases = async (purchasePromoId) => {

        let newElement = true
        this.state.purchases.forEach(purchase => {
            if (purchase.promoId == purchasePromoId) newElement = false
        })
        console.log(purchasePromoId);

        if (newElement) {
            let query = await db.collection("promos")
                .where("promoId", "==", purchasePromoId)
                .get()

            query.forEach(promoQuery => {
                let promo = promoQuery.data();
                let newArray = this.state.purchases
                newArray.push(promo)
                this.setState({
                    purchases: newArray
                })
            });
        }
    }
    render() {
        console.log('PURCHASES STATE' + this.state.purchases);
        return(
        <View  style={styles.container}>

            <FlatList
            onRefresh={() => this.getPurchases()}
            refreshing={false}
            style={{ paddingTop: 25, marginTop: 10 }}
            horizontal={false}
            numColumns={3}
            data={this.state.purchases}
            keyExtractor={item => JSON.stringify(item.date)}
            renderItem={({ item }) => (
            <TouchableOpacity
                onPress={() => {
                this.props.setCurrentPromo(item.promoId)
                this.props.navigation.navigate("PromoScreen")
                console.log("Press!")
                }}
            >

            <Image
                style={styles.squareLarge}
                source={{ uri: item.promoPhoto }}
            />
            </TouchableOpacity>
            )}
            />

        </View>
        )
    }

}

const mapDispatchToProps = dispatch => {
        return bindActionCreators({ setCurrentPromo }, dispatch);
    };
    
    const mapStateToProps = state => {
        return {
        user: state.user,
        profile: state.profile
        };
    };
    
    export default connect(
        mapStateToProps,
        mapDispatchToProps
    )(Purchases);



