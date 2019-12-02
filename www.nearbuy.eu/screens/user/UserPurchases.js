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
    ActivityIndicator,
    Modal,
    TouchableHighlight,
    Alert,
    Button
} from "react-native";
import Dialog, { ScaleAnimation, DialogTitle, DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';
import db from "../../config/firebase";
import { setCurrentPromo } from "../../actions/promo"


class Purchases extends React.Component {

    constructor() {
        super()
        this.state = {
            purchases: [],
            modalVisible: false,
            currentPromo: {},
            currentPurchase: {}
        }
    }

    componentDidMount = () => {

        this.getPurchases()
    };

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    setCurrentPromo(promo) {
        this.setState({currentPromo: promo});
    }

    setCurrentPurchase(promoId){
        const {
            purchases
        } = this.props.user
        if (purchases) {
            purchases.forEach(purchase => {
                if(promoId == purchase.promoId){
                    this.setState({currentPurchase: purchase});
                }
            })
        }
    }
    
    getPurchases = () => {
        const {
            purchases
        } = this.props.user
        if (purchases) {
            purchases.forEach(purchaseUid => {
                let purchasePromoId = parseInt(purchaseUid.promoId);
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
                this.setCurrentPromo(item)
                this.setCurrentPurchase(item.promoId)
                this.setModalVisible(true);
                }}
            >

            <Image
                style={styles.squareLarge}
                source={{ uri: item.promoPhoto }}
            />
            </TouchableOpacity>
            )}
            />



            <View style={styles.container}>
            <Dialog
                visible={this.state.modalVisible}
                dialogTitle={<DialogTitle title="Purchase" />}
                dialogAnimation={new ScaleAnimation({
                    initialValue: 0,
                    useNativeDriver: true, 
                })}
                footer={
                    <DialogFooter>
                        <DialogButton
                        text="Close"
                        onPress={() => {
                            this.setModalVisible(!this.state.modalVisible);
                        }}
                        />
                    </DialogFooter>
                }
            >
                    <DialogContent>
                        <Image
                        style={styles.squareLarge}
                        source={{ uri: this.state.currentPromo.promoPhoto }}
                        />
                        <Text>You purchase {this.state.currentPromo.title} on the {this.state.currentPurchase.date}</Text>
                        <Text>You save {this.state.currentPromo.percentage}% on this! KEEP BUYING SHIT!</Text>
                    </DialogContent>
                </Dialog>
            </View>

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



