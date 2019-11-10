import React, { Component } from "react";
import { Text, View, Image, Dimensions, ScrollView, TouchableOpacity, FlatList } from "react-native";
import db from "../../config/firebase";
import styles from "../../styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";


class Purchases extends React.Component {

    constructor() {
        super()
        this.state = {
            purchases: [],
        }
    
    }


    componentDidMount = () => {
    
        this.setState({purchases: this.props.user.purchases});
    };





    //blueprint 
    componentDidMount() {
        this.getLikes()
        }
    
    getLikes = () => {
        const {
            likePromos
        } = this.props.user
        if (likePromos) {
            likePromos.forEach(promoUid => {
                this.updateLikes(promoUid)
            })
        }
    }

    updateLikes = async (promoUid) => {
        let newElement = true
        this.state.promos.forEach(promo => {
            if (promo.promoId == promoUid) newElement = false
        })
    if (newElement) {
            let query = await db.collection("promos")
                .where("promoId", "==", promoUid)
                .get()

            query.forEach(promoQuery => {
                let promo = promoQuery.data();
                let newArray = this.state.promos
                newArray.push(promo)
                this.setState({
                    promos: newArray
                })
            });
        }
    }
    render() {
        console.log('PURCHASES STATE' + this.state.purchases );
        return(
        <View>

            <Text>
                Your purchases are: {this.state.purchases}
            </Text>
        




        {/* blueprint  */}
        <FlatList
        onRefresh={() => this.getLikes()}
        refreshing={false}
        style={{ paddingTop: 25, marginTop: 10 }}
        horizontal={false}
        numColumns={3}
        data={this.state.promos}
        keyExtractor={item => JSON.stringify(item.date)}
        renderItem={({ item }) => (
        <TouchableOpacity
            onPress={() => {
            this.props.setCurrentPromo(item.promoId)
            this.props.navigation.navigate("PromoScreen")
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
        return bindActionCreators({}, dispatch);
    };
    
    const mapStateToProps = state => {
        return {
        user: state.user
        };
    };
    
    export default connect(
        mapStateToProps,
        mapDispatchToProps
    )(Purchases);



