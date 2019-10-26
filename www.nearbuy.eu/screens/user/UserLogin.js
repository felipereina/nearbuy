import React, { Component } from "react";
import { Location, Permissions } from "expo"
import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import styles from "../../styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  updateEmail,
  updatePassword,
  login,
  getUser,
  facebookLogin,
  updateCurrentPosition,
  updateReferencePoint
} from "../../actions/user";
import firebase from "firebase";

class Login extends Component {

  componentDidMount = () => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.props.getUser(user.uid, "LOGIN");
        this.getPosition();
        if (this.props.user != null) {
          this.props.navigation.navigate("Home");
        }
      }
    });
  };

  getPosition = async () => {
    const permission = await Permissions.askAsync(Permissions.LOCATION);
    if (permission.status === "granted") {
      let currentPosition = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      currentPosition = {
        coords:
        {
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude
        }
      }
      this.props.updateCurrentPosition(currentPosition);
      this.props.updateReferencePoint(currentPosition);
    }
  };

  render() {
    return (
      <View style={[styles.container, styles.center]}>
        <Image
          style={{ width: 200, height: 200 }}
          source={require("../../assets/logo1.png")}
        />
        <TextInput
          style={styles.border}
          value={this.props.user.email}
          onChangeText={input => this.props.updateEmail(input)}
          placeholder="Email"
        />
        <TextInput
          style={styles.border}
          value={this.props.user.password}
          onChangeText={input => this.props.updatePassword(input)}
          placeholder="Password"
          secureTextEntry={true}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => this.props.login()}
        >
          <Text>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.facebookButton}
          onPress={() => this.props.facebookLogin()}
        >
          <Text style={{ color: "#ffffff" }}>Facebook Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => this.props.navigation.navigate("UserSignup")}
        >
          <Text>SignUp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.storeButton]}
          onPress={() => this.props.navigation.navigate("StoreLogin")}
        >
          <Text>I am a Store</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    { updateEmail, updatePassword, login, facebookLogin, getUser, updateCurrentPosition, updateReferencePoint },
    dispatch
  );
};

const mapStateToProps = state => {
  return { user: state.user };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
