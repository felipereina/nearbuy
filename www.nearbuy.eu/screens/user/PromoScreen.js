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
      currentPromo: "",
      currentImage: 0
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

  onScrollEnd = (e) => {
    let contentOffset = e.nativeEvent.contentOffset;
    let viewSize = e.nativeEvent.layoutMeasurement;

    // Divide the horizontal offset by the width of the view to see which page is visible
    let pageNum = Math.floor(contentOffset.x / viewSize.width);
    console.log('scrolled to page ', pageNum);

    this._handleImage(pageNum);
    
  }

  _handleImage = page => {
    this.setState({  currentImage : page });
  };

  render() {
    if (this.state.currentPromo !== "") {
      console.log("PROMOSCREEN", this.state.currentPromo)
      return (
        <View style={styles.container}>
          <View style={{ flexDirection: "row", justifyContent: "space-around", margin: 5 }}>
            {this.state.currentPromo.photoList.map((node, x) => {

              if(x == this.state.currentImage){
                return <Image style={{ width: 30, height: 30, borderRadius: 30 / 2, alignItems: "center",borderWidth:2, borderColor: "red"}} source={{ uri: node }} key={node} />

              }else {
              return <Image style={{ width: 30, height: 30, borderRadius: 30 / 2, alignItems: "center"}} source={{ uri: node }} key={node} />
              }
            })}
          </View> 
          
          
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={true}
            onMomentumScrollEnd={this.onScrollEnd}
            >
          
            {this.state.currentPromo.photoList.map((node, x) => {
              console.log(x);
              return <Image style={{ width: width, height: height - 120 }} source={{ uri: node }} key={node} />
            })}
          </ScrollView>
          <View style={{ alignItems: "center", flexDirection: "column", justifyContent: "space-between" }}>

            <Text>


            </Text>


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