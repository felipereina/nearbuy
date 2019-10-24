import React from "react";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { UserHomeNavigator, ProfileNavigator, QRnavigator } from "./StackNavigator";
import { createBottomTabNavigator, createAppContainer } from "react-navigation";

const TabNavigator = createBottomTabNavigator(
  {
    Home: {
      screen: UserHomeNavigator,
      navigationOptions: {
        tabBarLabel: " ",
        tabBarIcon: ({ focused }) => (
          <MaterialCommunityIcons
            name={focused ? "home" : "home-outline"}
            size={32}
          />
        )
      }
    },

    QRscanner: {
      screen:  QRnavigator,
      navigationOptions: {
        tabBarLabel: " ",
        tabBarIcon: ({ focused }) => (
          <MaterialCommunityIcons
            name={focused ? "home" : "home-outline"}
            size={15}
          />
        )
      }
    },

    MyProfile: {
      screen: ProfileNavigator,
      navigationOptions: {
        tabBarLabel: " ",
        tabBarIcon: ({ focused }) => (
          <FontAwesome name={focused ? "user" : "user-o"} size={32} />
        )
      }
    }
  },
  {
    tabBarOptions: {
      style: {
        paddingVertical: 10,
        height: 60
      }
    }
  }
);

export default createAppContainer(TabNavigator);
