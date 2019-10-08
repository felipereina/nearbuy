import React, { Component } from "react";
import { Text, View } from "react-native";
import styles from "../../styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

class PromoScreen extends Component {
  render() {
    console.log("PROMO SCREEN")
    console.log(this.props.user)
    
    return (
      <View>
        <Text>Promo Screen</Text>
      </View>
    );
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
)(PromoScreen);