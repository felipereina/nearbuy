import React, { Component } from "react";
import { Text, View, Image, Dimensions, ScrollView, TouchableOpacity, FlatList } from "react-native";
import db from "../../config/firebase";
import styles from "../../styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import QRCode from 'react-native-qrcode-svg';


const { width, height } = Dimensions.get("window")

class PromoScreen extends Component {

  constructor() {
    super()
    this.state = {
      currentPromo: "",
      currentImage: 0,
      QRCodeRequest: false
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
    let pageNum = Math.floor(contentOffset.x / viewSize.width);

    this._handleImage(pageNum);    
  }

  _handleImage = page => {
    this.setState({  currentImage : page });
  }

  _handleQRcodeRequest = () => {

    this.setState({QRCodeRequest : true});
  }

  buttonQRcode = promoId => {

    console.log(promoId)

    if(!this.state.QRCodeRequest){
      return (
        <View> 
          <TouchableOpacity style={[styles.button, { alignItems: "center", position: "relative", marginTop: 30, marginBottom: 30 }]}
          onPress={() => { 
            this._handleQRcodeRequest();
          }}
          >
            <Text>Get Promo Code</Text>
          </TouchableOpacity>
        </View>  
        );
    } else if(this.state.QRCodeRequest) {
      return (
        <View>
          <View style={{ alignItems: "center", position: "relative", marginTop: 30, marginBottom: 30 }}>
          <QRCode
            value= {promoId}
            size={200}
            color='black'
            backgroundColor='white'
          />
          </View>
        </View>
          )

    }
  }

  render() {
    if (this.state.currentPromo !== "") {
      console.log("PROMOSCREEN", this.state.currentPromo)
      return (
        <View style={styles.container}>

          <ScrollView
          vertical
            
          >

            <View style={{ flexDirection: "row", justifyContent: "space-around", margin: 5 }}>
              {this.state.currentPromo.photoList.map((node, x) => {

                if(x == this.state.currentImage){
                  return <Image style={{ width: 30, height: 30, borderRadius: 30 / 2, alignItems: "center",borderWidth:3, borderColor: "rgba(51,51,204,0.3)"}} source={{ uri: node }} key={node} />

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
            
                return <Image style={{ width: width, height: height - 230, flex:1 }} resizeMode="contain" source={{ uri: node }} key={node} />
              })}
            </ScrollView>
            <View style={{ alignItems: "center", flexDirection: "column", justifyContent: "space-between" }}>

              <Text style={{fontSize: 22, fontWeight:'bold'}}>
                {this.state.currentPromo.title}    
              </Text>
              
              <View style={{alignItems:"center", flexDirection:"row", justifyContent:"space-around"}}>
                <Text  style={{fontSize:18,fontWeight:"bold", paddingRight:6}}>
                    {this.state.currentPromo.newPrice}    
                </Text>
                <Text style={{color:"rgba(85,85,85,0.8)", fontSize:14, textDecorationLine:"line-through"}}> 
                  {this.state.currentPromo.oldPrice}
                </Text>
              </View>

              <View  style={{flexDirection:"row", alignItems:"center", padding:5}}>
                <Text> Save </Text>
                <View style={{backgroundColor:"red",width:35, height:35, borderRadius: 35/2}}><Text style={{color:"white", position: "absolute", bottom: 10 }}>{this.state.currentPromo.percentage}%</Text></View> 
                <Text>on this item! 
                </Text>
              </View>

              <View>
              {this.buttonQRcode(`${this.props.user.uid}/${this.props.user.username}/${this.state.currentPromo.title}/${this.state.currentPromo.promoId}`)}
              </View>            

            </View>

          </ScrollView>

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