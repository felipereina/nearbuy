import React, { Component } from 'react';
import { View, TextInput, TouchableOpacity, Text,} from 'react-native';
import styles from '../styles'
import { connect } from 'react-redux'
import QRCode from 'react-native-qrcode';


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
      <View style={styles.MainContainer}>

        <QRCode
          value={this.state.valueForQRCode}
          size={250}
          bgColor="#000"
          fgColor="#fff"
        />

        <TextInput
          style={styles.TextInputStyle}
          onChangeText={text => this.setState({ inputValue: text })}
          underlineColorAndroid="transparent"
          placeholder="Enter text to Generate QR Code"
        />

        <TouchableOpacity
          onPress={this.getTextInputValue}
          activeOpacity={0.7}
          style={styles.button1}>
          <Text style={styles.TextStyle}> Generate QR Code </Text>
        </TouchableOpacity>

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