import React, { Component } from "react";
import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import styles from "../../styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { ImagePicker, Permissions } from "expo";
import {
  updateStoreEmail,
  updateStorePassword,
  updateStoreName,
  signupStore,
  updateStorePhoto,
  updateStore
} from "../../actions/store";
import { uploadPhoto } from "../../actions";
import firebase from "firebase";

class StoreSignup extends Component {
  onPress = () => {
    const { routeName } = this.props.navigation.state;
    if (routeName === "StoreSignup") {
      this.props.signupStore();
      this.props.navigation.navigate("StoreHome");
    } else {
      this.props.updateStore();
      this.props.navigation.goBack();
    }
  };

  openLibrary = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === "granted") {
      const image = await ImagePicker.launchImageLibraryAsync();
      if (!image.cancelled) {
        const url = await this.props.uploadPhoto(image);
        this.props.updateStorePhoto(url);
      }
    }
  };

  render() {
    const { routeName } = this.props.navigation.state;
    return (
      <View style={[styles.container, styles.center]}>
        <TouchableOpacity style={styles.center} onPress={this.openLibrary}>
          <Image
            style={styles.roundImage}
            source={{ uri: this.props.store.photo }}
          />
          <Text>Upload Photo</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.border}
          editable={routeName === "StoreSignup" ? true : false}
          value={this.props.store.email}
          onChangeText={input => this.props.updateStoreEmail(input)}
          placeholder="Email"
        />
        <TextInput
          style={styles.border}
          editable={routeName === "StoreSignup" ? true : false}
          value={this.props.store.password}
          onChangeText={input => this.props.updateStorePassword(input)}
          placeholder="Password"
          secureTextEntry={true}
        />
        <TextInput
          style={styles.border}
          value={this.props.store.username}
          onChangeText={input => this.props.updateStoreName(input)}
          placeholder="Storename"
        />
        <TouchableOpacity style={styles.button} onPress={this.onPress}>
          <Text>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      updateStorePhoto,
      uploadPhoto,
      updateStore,
      updateStoreEmail,
      updateStorePassword,
      updateStoreName,
      signupStore
    },
    dispatch
  );
};

const mapStateToProps = state => {
  return { store: state.store };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StoreSignup);
