import React, { Component } from "react";
import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import styles from "../../styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { ImagePicker, Permissions } from "expo";
import {
  updateEmail,
  updatePassword,
  updateUserName,
  updateGender,
  updateAge,
  signup,
  updatePhoto,
  updateUser
} from "../../actions/user";
import { uploadPhoto } from "../../actions";
import firebase from "firebase";

class Signup extends Component {
  onPress = () => {
    const { routeName } = this.props.navigation.state;
    if (routeName === "Signup") {
      this.props.signup();
      this.props.navigation.navigate("Home");
    } else {
      this.props.updateUser();
      this.props.navigation.goBack();
    }
  };

  openLibrary = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === "granted") {
      const image = await ImagePicker.launchImageLibraryAsync();
      if (!image.cancelled) {
        const url = await this.props.uploadPhoto(image);
        this.props.updatePhoto(url);
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
            source={{ uri: this.props.user.photo }}
          />
          <Text>Upload Photo</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.border}
          editable={routeName === "Signup" ? true : false}
          value={this.props.user.email}
          onChangeText={input => this.props.updateEmail(input)}
          placeholder="Email"
        />
        <TextInput
          style={styles.border}
          editable={routeName === "Signup" ? true : false}
          value={this.props.user.password}
          onChangeText={input => this.props.updatePassword(input)}
          placeholder="Password"
          secureTextEntry={true}
        />
        <TextInput
          style={styles.border}
          value={this.props.user.username}
          onChangeText={input => this.props.updateUserName(input)}
          placeholder="Username"
        />
        <TextInput
          style={styles.border}
          value={this.props.user.gender}
          onChangeText={input => this.props.updateGender(input)}
          placeholder="Gender"
        />
        <TextInput
          style={styles.border}
          value={this.props.user.age}
          onChangeText={input => this.props.updateAge(input)}
          placeholder="Age"
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
      updatePhoto,
      uploadPhoto,
      updateUser,
      updateEmail,
      updatePassword,
      updateUserName,
      updateGender,
      updateAge,
      signup
    },
    dispatch
  );
};

const mapStateToProps = state => {
  return { user: state.user };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Signup);
