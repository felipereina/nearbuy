import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  Animated,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Picker,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import db from "../../config/firebase";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;
const Promos = [
  {
    id: "1",
    gender: "female",
    category: "sapatos",
    subcategory: "sapatilhas",
    title: "sapatilhas chunky tecnicas as cores",
    oldPrice: "35,99",
    newPrice: "12,99",
    percentage: "-64%",
    uri: require("../../assets/promo1.jpg")
  },
  {
    id: "2",
    gender: "female",
    category: "vestuario",
    subcategory: "fatos de banho",
    title: "Fato de banho as riscas laranjas",
    oldPrice: "19,99",
    newPrice: "7,99",
    percentage: "-60%",
    uri: require("../../assets/promo2.jpg")
  },
  {
    id: "3",
    gender: "female",
    category: "vestuario",
    subcategory: "vestidos",
    title: "Vestido comprido em crepe",
    oldPrice: "15,99",
    newPrice: "5,99",
    percentage: "-63%",
    uri: require("../../assets/promo3.jpg")
  },
  {
    id: "4",
    gender: "female",
    category: "vestuario",
    subcategory: "jardineiras e macacoes",
    title: "Jardineiras de ganga brancas",
    oldPrice: "19,99",
    newPrice: "12,99",
    percentage: "-35%",
    uri: require("../../assets/promo4.jpg")
  },
  {
    id: "5",
    gender: "female",
    category: "sapatos",
    subcategory: "cunhas e plataformas",
    title: "Cunha de juta com tie-dye",
    oldPrice: "25,99",
    newPrice: "12,99",
    percentage: "-50%",
    uri: require("../../assets/promo5.jpg")
  }
];

class Home extends Component {
  constructor() {
    super();

    this.position = new Animated.ValueXY();
    this.state = {
      currentIndex: 0,
      promos: [],
      modalVisible: false,
      gender: "all",
      category: "all",
      subcategory: "all"
    };
    this.rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ["-10deg", "0deg", "10deg"],
      extrapolate: "clamp"
    });

    this.rotateAndTranslate = {
      transform: [
        { rotate: this.rotate },
        ...this.position.getTranslateTransform()
      ]
    };

    this.likeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [0, 0, 1],
      extrapolate: "clamp"
    });

    this.dislikeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 0],
      extrapolate: "clamp"
    });

    this.nextCardOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 1],
      extrapolate: "clamp"
    });

    this.nextCardScale = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0.8, 1],
      extrapolate: "clamp"
    });
  }

  getAllPromos = async () => {
    let promos = [];
    const query = await db.collection("promos").get();

    query.forEach(response => {
      promos.push(response.data());
    });
    this.setState({ promos: promos });
  };

  /* -----------------------------------------------------------------------------------------------------
   * FILTER PROMO METHOD
   *
   *
   */

  filterPromos = async (gender, category, subcategory) => {
    console.log(">>>gender:");
    console.log(gender);

    console.log(">>>gender:");
    console.log(category);

    console.log(">>>subcategory:");
    console.log(subcategory);

    let promos = [];
    let query = db.collection("promos");

    if (gender === "all") gender = "";
    if (category === "all") category = "";
    if (subcategory === "all") subcategory = "";

    if (gender) query = query.where("gender", "==", gender);
    if (category) query = query.where("category", "==", category);
    if (subcategory) query = query.where("subcategory", "==", subcategory);

    query = await query.get();

    query.forEach(response => {
      promos.push(response.data());
    });

    console.log(">>>PROMOS:");
    console.log(promos);
    this.setState({ promos: promos });
  };

  // -----------------------------------------------------------------------------------------------------

  componentWillMount = () => {
    this.getAllPromos();

    this.PanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        this.position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 120) {
          Animated.spring(this.position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy }
          }).start(() => {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 });
            });
          });
        } else if (gestureState.dx < -120) {
          Animated.spring(this.position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy }
          }).start(() => {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 });
            });
          });
        } else {
          Animated.spring(this.position, {
            toValue: { x: 0, y: 0 },
            friction: 4
          }).start();
        }
      }
    });
  };

  renderPromos = promos => {
    return promos
      .map((item, i) => {
        if (i < this.state.currentIndex) {
          return null;
        } else if (i == this.state.currentIndex) {
          return (
            <Animated.View
              {...this.PanResponder.panHandlers}
              key={item.promoId}
              style={[
                this.rotateAndTranslate,
                {
                  height: SCREEN_HEIGHT - 120,
                  width: SCREEN_WIDTH,
                  padding: 10,
                  position: "absolute"
                }
              ]}
            >
              <Animated.View
                key={item.promoId + "like"}
                style={{
                  opacity: this.likeOpacity,
                  transform: [{ rotate: "-30deg" }],
                  position: "absolute",
                  top: 50,
                  left: 40,
                  zIndex: 1000
                }}
              >
                <Text
                  style={{
                    borderWidth: 1,
                    borderColor: "green",
                    color: "green",
                    fontSize: 32,
                    fontWeight: "800",
                    padding: 10
                  }}
                >
                  LIKE
                </Text>
              </Animated.View>
              <Animated.View
                key={item.promoId + "nope"}
                style={{
                  opacity: this.dislikeOpacity,
                  transform: [{ rotate: "30deg" }],
                  position: "absolute",
                  top: 50,
                  right: 40,
                  zIndex: 1000
                }}
              >
                <Text
                  style={{
                    borderWidth: 1,
                    borderColor: "red",
                    color: "red",
                    fontSize: 32,
                    fontWeight: "800",
                    padding: 10
                  }}
                >
                  NOPE
                </Text>
              </Animated.View>
              <Animated.View
                key={item.promoId + "oldPrice"}
                style={{
                  position: "absolute",
                  bottom: 30,
                  left: 40,
                  zIndex: 1000
                }}
              >
                <Text
                  style={{
                    textDecorationLine: "line-through",
                    textDecorationStyle: "solid",
                    color: "red",
                    fontSize: 20,
                    fontWeight: "400",
                    padding: 10
                  }}
                >
                  $ {item.oldPrice}
                </Text>
              </Animated.View>
              <Animated.View
                key={item.promoId + "newPrice"}
                style={{
                  position: "absolute",
                  bottom: 30,
                  right: 40,
                  zIndex: 1000
                }}
              >
                <Text
                  style={{
                    borderWidth: 1,
                    borderColor: "green",
                    color: "green",
                    backgroundColor: "white",
                    opacity: 0.75,
                    fontSize: 20,
                    fontWeight: "400",
                    padding: 10
                  }}
                >
                  $ {item.newPrice}
                </Text>
              </Animated.View>
              <Animated.View
                key={item.promoId + "percentage"}
                style={{
                  position: "absolute",
                  bottom: 70,
                  right: 20,
                  zIndex: 1000
                }}
              >
                <Text
                  style={{
                    borderWidth: 1,
                    color: "white",
                    borderColor: "red",
                    backgroundColor: "red",
                    fontSize: 12,
                    fontWeight: "200",
                    padding: 5
                  }}
                >
                  {item.percentage}%
                </Text>
              </Animated.View>
              <View
                key={item.promoId + "titleview"}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 0.1,
                  flexDirection: "row"
                }}
              >
                <Text
                  key={item.promoId + "title"}
                  style={{ fontWeight: "800", padding: 3 }}
                >
                  {item.title}
                </Text>
                <TouchableOpacity
                  key={item.promoId + "search"}
                  style={{ position: "absolute", right: 10 }}
                  onPress={() => this.setModalVisible(true)}
                >
                  <Ionicons style={{ margin: 5 }} name="ios-search" size={40} />
                </TouchableOpacity>
              </View>
              <Image
                key={item.promoId + "promoImage"}
                style={{
                  flex: 1,
                  height: null,
                  width: null,
                  resizeMode: "cover",
                  borderRadius: 20
                }}
                source={{ uri: item.promoPhoto }}
              />
            </Animated.View>
          );
        } else {
          return (
            <Animated.View
              key={item.promoId}
              style={[
                {
                  opacity: this.nextCardOpacity,
                  transform: [{ scale: this.nextCardScale }],
                  height: SCREEN_HEIGHT - 120,
                  width: SCREEN_WIDTH,
                  padding: 10,
                  position: "absolute"
                }
              ]}
            >
              <Image
                key={item.promoId + "promoImage"}
                style={{
                  flex: 1,
                  height: null,
                  width: null,
                  resizeMode: "cover",
                  borderRadius: 20
                }}
                source={item.uri}
              />
            </Animated.View>
          );
        }
      })
      .reverse();
  };

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ marginTop: 22 }}>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
            }}
          >
            <View style={{ marginTop: 22 }}>
              <View
                style={{
                  flex: 1,
                  alignItems: "center"
                }}
              >
                <Text style={{ fontWeight: "300" }}>Gender</Text>

                <Picker
                  style={{
                    height: 50,
                    width: 200,
                    margin: 25,
                    marginTop: 0
                  }}
                  selectedValue={this.state.gender}
                  onValueChange={(itemValue, itemIndex) =>
                    this.setState({ gender: itemValue })
                  }
                >
                  <Picker.Item label="All" value="all" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Male" value="male" />
                </Picker>

                <Text
                  style={{
                    margin: 5,
                    fontSize: 30
                  }}
                >
                  Category
                </Text>

                <Picker
                  style={{ height: 50, width: 200, margin: 25 }}
                  selectedValue={this.state.category}
                  onValueChange={(itemValue, itemIndex) =>
                    this.setState({ category: itemValue })
                  }
                >
                  <Picker.Item label="All" value="all" />
                  <Picker.Item label="Vestuario" value="vestuario" />
                  <Picker.Item label="Sapatos" value="sapatos" />
                  <Picker.Item label="Acessorios" value="acessorios" />
                </Picker>

                <Text style={{ fontWeight: "300" }}>Subcategory</Text>

                <Picker
                  style={{ height: 50, width: 200, margin: 25 }}
                  selectedValue={this.state.subcategory}
                  onValueChange={(itemValue, itemIndex) =>
                    this.setState({ subcategory: itemValue })
                  }
                >
                  <Picker.Item label="All" value="all" />
                  <Picker.Item label="T-Shirt" value="t-shirt" />
                  <Picker.Item
                    label="Tops e Bralettes"
                    value="tops-e-bralettes"
                  />
                  <Picker.Item
                    label="Blusas e Camisas"
                    value="blusas-e-camisas"
                  />
                  <Picker.Item label="Vestidos" value="vestidos" />
                  <Picker.Item
                    label="Jardineiras e Macacoes"
                    value="jardineiras-e-macacoes"
                  />
                  <Picker.Item
                    label="Bermudas e Shorts"
                    value="bermudas-e-shorts"
                  />
                  <Picker.Item label="Saias" value="saias" />
                  <Picker.Item label="Jeans" value="jeans" />
                  <Picker.Item label="Calcas" value="calcas" />
                  <Picker.Item
                    label="Casacos e Blusoes"
                    value="casacos-e-blusoes"
                  />
                  <Picker.Item label="Sweatshirts" value="sweatshirts" />
                  <Picker.Item label="Malha" value="malha" />
                  <Picker.Item label="Roupa de Banho" value="roupa-de-banho" />
                </Picker>

                {/* <Picker
                  style={{ height: 50, width: 200, margin: 25 }}
                  selectedValue={this.state.subcategory}
                  onValueChange={(itemValue, itemIndex) =>
                    this.setState({ subcategory: itemValue })
                  }
                >
                  <Picker.Item label="All" value="all" />
                  <Picker.Item label="T-Shirt" value="t-shirt" />
                  <Picker.Item label="Camisas" value="camisas" />
                  <Picker.Item label="Polos" value="polos" />
                  <Picker.Item
                    label="Camisolas e Cardigas"
                    value="camisolas-e-cardigas"
                  />
                  <Picker.Item label="Sweatshirts" value="sweatshirts" />
                  <Picker.Item label="Blazers" value="blazers" />
                  <Picker.Item label="Fatos" value="fatos" />
                  <Picker.Item label="Casacos" value="casacos" />
                  <Picker.Item label="Calcas" value="calcas" />
                  <Picker.Item label="Peles" value="peles" />
                  <Picker.Item label="Sobretudos" value="sobretudos" />
                  <Picker.Item label="Jeans" value="jeans" />
                  <Picker.Item label="Roupa de Banho" value="roupa-de-banho" />

                  <Picker.Item label="Roupa Interior" value="roupa-interior" />
                  <Picker.Item label="Calcoes" value="calcoes" />
                </Picker> */}
              </View>
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <TouchableOpacity
                  style={{
                    marginTop: 20,
                    paddingVertical: 10,
                    alignItems: "center",
                    borderColor: "#d3d3d3",
                    borderWidth: 1,
                    borderRadius: 5,
                    width: 200
                  }}
                  onPress={() => {
                    this.filterPromos(
                      this.state.gender,
                      this.state.category,
                      this.state.subcategory
                    );
                    this.setModalVisible(!this.state.modalVisible);
                  }}
                >
                  <Text>Filter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.container}>
          {this.renderPromos(this.state.promos)}
        </View>
        <View style={{ height: 60 }} />
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({}, dispatch);
};

const mapStateToProps = state => {
  return {
    post: state.post,
    user: state.user
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
