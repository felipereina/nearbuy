import React from "react";
import { Ionicons } from "@expo/vector-icons";
import StoreHomeScreen from "../screens/store/StoreHome";
import UserHomeScreen from "../screens/user/UserHome";
import UserFilterScreen from "../screens/user/UserFilter";
import PromoScreen from "../screens/user/PromoScreen";
import UserProfileScreen from "../screens/user/UserProfile";
import EditScreen from "../screens/user/UserSignup";
import { createStackNavigator, createAppContainer } from "react-navigation";
import { TouchableOpacity, Image } from "react-native";

export const StoreHomeNavigator = createAppContainer(
  createStackNavigator({
    StoreHome: {
      screen: StoreHomeScreen,
      navigationOptions: () => ({
        headerTitle: (
          <Image
            style={{ width: 80, height: 80 }}
            source={require("../assets/logo1.png")}
          />
        )
      })
    }
  })
);

export const UserHomeNavigator = createAppContainer(
  createStackNavigator({
    Home: {
      screen: UserHomeScreen,
      navigationOptions: () => ({
        headerTitle: (
          <Image
            style={{ width: 80, height: 80 }}
            source={require("../assets/logo1.png")}
          />
        )
      })
    },
    PromoScreen: {
      screen: PromoScreen,
      navigationOptions: () => ({
        title: 'PromoScreen'
      })
    },
  })
);

export const ProfileNavigator = createAppContainer(
  createStackNavigator({
    MyProfile: {
      screen: UserProfileScreen,
      navigationOptions: {
        title: "My Profile"
      }
    },
    Edit: {
      screen: EditScreen,
      navigationOptions: ({ navigation }) => ({
        title: "Edit Profile",
        headerLeft: (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons style={styles.icon} name={"ios-arrow-back"} size={30} />
          </TouchableOpacity>
        )
      })
    }
  })
);
