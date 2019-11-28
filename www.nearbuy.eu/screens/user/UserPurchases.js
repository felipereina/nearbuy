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
    Alert
} from "react-native";
import db from "../../config/firebase";
import { setCurrentPromo } from "../../actions/promo"


class Purchases extends React.Component {

    constructor() {
        super()
        this.state = {
            purchases: [],
            modalVisible: false
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

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
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

    purchasePopUp = () => {

        console.log("MODALLLL " + this.state.modalVisible)

        return (
            
            <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {
                Alert.alert('Modal has been closed.');
            }}>
            <View style={{marginTop: 22}}>
                <View>
                <Text>Hello World!</Text>

                <TouchableHighlight
                    onPress={() => {
                    this.setModalVisible(!this.state.modalVisible);
                    }}>
                    <Text>Hide Modal</Text>
                </TouchableHighlight>
                </View>
            </View>
            </Modal>
        );
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
                //this.props.setCurrentPromo(item.promoId)
                this.setModalVisible(true);
                //this.purchasePopUp();
                }}
            >

            <Image
                style={styles.squareLarge}
                source={{ uri: item.promoPhoto }}
            />
            </TouchableOpacity>
            )}
            />

            <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {
                Alert.alert('Modal has been closed.');
            }}>
            <View style={{marginTop: 22}}>
                <View>
                <Text>Hello World!</Text>

                <TouchableHighlight
                    onPress={() => {
                    this.setModalVisible(!this.state.modalVisible);
                    }}>
                    <Text>Hide Modal</Text>
                </TouchableHighlight>
                </View>
            </View>
            </Modal>

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



