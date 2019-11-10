import * as React from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { validateQRcode } from "../../actions/store";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { BarCodeScanner } from 'expo-barcode-scanner';

  class QRscanner extends React.Component {
  state = {
    hasCameraPermission: null,
    scanned: false,
  };

  async componentDidMount() {
    this.getPermissionsAsync();
  }

  getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  };

  handleBarCodeScanned = ({ type, data }) => {
    let data_split = data.split("/");
    let user_name = data_split[1];
    let promo_title = data_split[2];

    Alert.alert(
      'Purchase Scan',
      `The purchase made by the user "${user_name}" of the promo "${promo_title}" was validated!`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ],
      {cancelable: false},
    );
    this.props.validateQRcode(data);
    
    this.setState({ scanned: true });
  }

  render() {
    const { hasCameraPermission, scanned } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission, please wait.</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera. Please give the permissions to use this feature.</Text>;
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />

        {scanned && (
          <Button title={'Tap to Scan Again'} onPress={() => this.setState({ scanned: false })} />
        )}
      </View>
    );
  }

}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({
    validateQRcode
  }, dispatch);
};

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QRscanner);
