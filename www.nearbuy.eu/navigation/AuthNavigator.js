import React from "react";
import { Ionicons } from "@expo/vector-icons";
import UserLoginScreen from "../screens/user/UserLogin";
import UserSignupScreen from "../screens/user/UserSignup";
import StoreLoginScreen from "../screens/store/StoreLogin";
import StoreSignupScreen from "../screens/store/StoreSignup";
import { createStackNavigator, createAppContainer } from "react-navigation";
import { TouchableOpacity } from "react-native";

const StackNavigator = createStackNavigator({
  UserLogin: {
    screen: UserLoginScreen,
    navigationOptions: {
      header: null
    }
  },
  UserSignup: {
    screen: UserSignupScreen,
    navigationOptions: ({ navigation }) => ({
      title: "Signup",
      headerLeft: (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons style={styles.icon} name={"ios-arrow-back"} size={30} />
        </TouchableOpacity>
      )
    })
  },
  StoreLogin: {
    screen: StoreLoginScreen,
    navigationOptions: ({ navigation }) => ({
      title: "StoreLogin",
      headerLeft: (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons style={styles.icon} name={"ios-arrow-back"} size={30} />
        </TouchableOpacity>
      )
    })
  },
  StoreSignup: {
    screen: StoreSignupScreen,
    navigationOptions: ({ navigation }) => ({
      title: "StoreSignup",
      headerLeft: (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons style={styles.icon} name={"ios-arrow-back"} size={30} />
        </TouchableOpacity>
      )
    })
  }
});

export default createAppContainer(StackNavigator);
