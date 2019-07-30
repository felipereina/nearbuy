import React, { Component } from "react";
import { Text, View } from "react-native";
import styles from "../../styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

class StoreHome extends Component {
  render() {
    return (
      <View>
        <Text>Store Home</Text>
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({}, dispatch);
};

const mapStateToProps = state => {
  return {
    store: state.store
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StoreHome);
