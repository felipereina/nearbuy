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
    
    render() {
        console.log('PURCHASES STATE' + this.state.purchases );
        return(
        <View>

            <Text>
                Your purchases are: {this.state.purchases}
            </Text>
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



