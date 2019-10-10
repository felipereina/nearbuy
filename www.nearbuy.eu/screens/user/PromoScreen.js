import React, { Component } from "react";
import { Text, View, Image, Dimensions, ScrollView, TouchableOpacity } from "react-native";
import db from "../../config/firebase";
import styles from "../../styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

const { width, height } = Dimensions.get("window")

class PromoScreen extends Component {

  constructor() {
    super()
    this.state = {
      currentPromo: ""
    }
  }

  componentDidMount() {
    let promoUid = this.props.promo.currentPromo
    this.getPromo(promoUid)
  }

  getPromo = async (promoUid) => {
    if (promoUid) {
      let query = await db.collection("promos").where("promoId", "==", promoUid).get();
      query.forEach(response => {
        this.setState({ currentPromo: response.data() })
      });
    }
  }

  render() {
    if (this.state.currentPromo !== "") {
      console.log("PROMOSCREEN", this.state.currentPromo)
      return (
        <View style={styles.container}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={true}
          >
            {this.state.currentPromo.photoList.map((node) => {
              return <Image style={{ width: width, height: height - 120 }} source={{ uri: node }} key={node} />
            })}
          </ScrollView>
          <View style={{ alignItems: "center", flexDirection: "column", justifyContent: "space-between" }}>
            <TouchableOpacity style={[styles.button, { alignItems: "center", position: "relative", marginTop: 5 }]}
            onPress={() => { 
              this.props.navigation.navigate("UserQrCode")
            }}
            >
              <Text>Get Promo Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return null
    }
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({}, dispatch);
};

const mapStateToProps = state => {
  return {
    user: state.user,
    promo: state.promo
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PromoScreen);