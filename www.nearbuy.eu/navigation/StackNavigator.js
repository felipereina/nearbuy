import React from "react";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import StoreHomeScreen from "../screens/store/StoreHome";
import UserHomeScreen from "../screens/user/UserHome";
import PromoScreen from "../screens/user/PromoScreen";
import UserProfileScreen from "../screens/user/UserProfile";
import UserQrCode from "../screens/user/UserQrCode";
import EditScreen from "../screens/user/UserSignup";
import MapScreen from "../screens/user/UserLocation"
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
      navigationOptions: ({ navigation }) => ({
        title: 'PromoScreen',
        headerRight: (
          <TouchableOpacity onPress={() => navigation.navigate('Map')} >
            <FontAwesome style={{marginRight: 10}} name={'map-marker'} size={30}/>
          </TouchableOpacity>
        ),

      })
    },
    UserQrCode: {
      screen: UserQrCode,
      navigationOptions: () => ({
        title: 'QrCodeScreen',
        headerRight: (
          <TouchableOpacity onPress={() => navigation.navigate('Map')} >
            <FontAwesome style={{marginRight: 10}} name={'map-marker'} size={30}/>
          </TouchableOpacity>
        ),
      })
    },
    Map: {
      screen: MapScreen,
      navigationOptions: ({ navigation }) => ({
        title: 'MapView',
        headerLeft: (
          <TouchableOpacity onPress={() => navigation.goBack()} >
            <Ionicons style={styles.icon} name={'ios-arrow-back'} size={30}/>
          </TouchableOpacity>
        )
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
