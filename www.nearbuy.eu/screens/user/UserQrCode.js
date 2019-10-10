import React, { Component } from 'react';
import { View, TextInput, TouchableOpacity, Text,} from 'react-native';
import styles from "../../styles";
import { connect } from 'react-redux'
import QRCode from 'react-native-qrcode-svg';


class QrCode extends Component {

  constructor() {
    super();
    this.state = {
      inputValue: '',
      valueForQRCode: '',
    };
  }

  getTextInputValue = () => {
    this.setState({ valueForQRCode: this.state.inputValue });
  };


  render() {
    return (
      <View>
        <View style={{ alignItems: "center", flexDirection: "column", justifyContent: "space-between", marginTop: 50 }}>
        <QRCode
          value="http://facebook.github.io/react-native/"  //{this.state.valueForQRCode}
          size={250}
          color='black'
          backgroundColor='white'
        />
        </View>
       {/*  <View style={{ alignItems: "center", flexDirection: "column", justifyContent: "space-between" }}>
        <TextInput 
          style={styles.TextInputStyle}
          onChangeText={text => this.setState({ inputValue: text })}
          underlineColorAndroid="transparent"
          placeholder="Enter text to Generate QR Code"
        />
        </View>
        <View style={{ alignItems: "center", flexDirection: "column", justifyContent: "space-between" }}>
        <TouchableOpacity
          onPress={this.getTextInputValue}
          activeOpacity={0.7}
          style={[styles.button, { alignItems: "center", position: "relative", marginTop: 5 }]}>
          <Text style={styles.TextStyle}> Generate QR Code </Text>
        </TouchableOpacity>
        </View> */}
      </View>

    );
  }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({}, dispatch)
}

const mapStateToProps = (state) => {
    return { obj: state}
}

export default connect(mapStateToProps)(QrCode);