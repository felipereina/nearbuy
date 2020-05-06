import React from "react";
import styles from "../../styles";
import firebase from "firebase";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from "react-native";
import db from "../../config/firebase";
import { setCurrentPromo } from "../../actions/promo"

class Profile extends React.Component {

  constructor() {
    super()
    this.state = {
      promos: []
    }
  }

  componentDidMount() {
    this.getLikes()
  }

  getLikes = () => {
    const { likePromos } = this.props.user
    if (likePromos) {
      likePromos.forEach(promoUid => {
        this.updateLikes(promoUid)
      })
    }
  }

  updateLikes = async (promoUid) => {
    let newElement = true
    this.state.promos.forEach( promo => {
      if (promo.promoId == promoUid) newElement = false
    })

    if (newElement) {
      let query = await db.collection("promos")
        .where("promoId", "==", promoUid)
        .get()

      query.forEach(promoQuery => {
        let promo = promoQuery.data();
        let newArray = this.state.promos
        newArray.push(promo)
        this.setState({ promos: newArray })
      });
    }
  }



  render() {
    let user = {};
    const { state, navigate } = this.props.navigation;
    if (state.routeName === "Profile") {
      user = this.props.profile;
    } else {
      user = this.props.user;
    }
    if (!user.posts) return <ActivityIndicator style={styles.container} />;
    return (
      <View style={styles.container}>
        <View style={[styles.row, styles.space, { paddingHorizontal: 20 }]}>
          <View style={styles.center}>
            <Image style={styles.roundImage} source={{ uri: user.photo }} />
            <Text>{user.username}</Text>
            <Text>{user.bio}</Text>
          </View>
        </View>
        <View style={styles.center}>
          {state.routeName === "MyProfile" ? (
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.buttonSmall}
                onPress={() => this.props.navigation.navigate("Edit")}
              >
                <Text style={styles.bold}>Edit Profile</Text>
              </TouchableOpacity>



              {/* <TouchableOpacity
                style={styles.buttonSmall}
                onPress={() => this.props.navigation.navigate("Purchases")}
              >
                <Text style={styles.bold}>My Purchases</Text>
              </TouchableOpacity> */}



              <TouchableOpacity
                style={styles.buttonSmall}
                onPress={() => {
                  firebase.auth().signOut();
                  this.props.navigation.navigate("Login");
                }}
              >
                <Text style={styles.bold}>Logout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.buttonSmall}
                onPress={() => this.follow(user)}
              >
                <Text style={styles.bold}>
                  {user.followers.indexOf(this.props.user.uid) >= 0
                    ? "UnFollow User"
                    : "Follow User"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonSmall}
                onPress={() => this.props.navigation.navigate("Chat", user.uid)}
              >
                <Text style={styles.bold}>Message</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <FlatList
          onRefresh={() => this.getLikes()}
          refreshing={false}
          style={{ paddingTop: 25, marginTop: 10 }}
          horizontal={false}
          numColumns={3}
          data={this.state.promos}
          keyExtractor={item => JSON.stringify(item.date)}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                this.props.setCurrentPromo(item.promoId)
                this.props.navigation.navigate("PromoScreen")
              }}
            >
            <Image
              style={styles.squareLarge}
              source={{ uri: item.promoPhoto }}
            />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ setCurrentPromo }, dispatch);
};

const mapStateToProps = state => {
  return {
    user: state.user,
    profile: state.profile
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);
