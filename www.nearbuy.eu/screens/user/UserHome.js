import React, { Component } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Picker,
  Modal
} from "react-native";
import styles from "../../styles";
import { Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import db from "../../config/firebase";
import { genderList, categoryList, subCategoryList } from "../../constants/filters"
import PromoCards from "../../components/PromoCards"
import { setCurrentPromo, setCardIndex } from "../../actions/promo"


class Home extends Component {
  constructor() {
    super();
    this.state = {
      lastTap: null,
      currentIndex: 0,
      promos: [],
      modalVisible: false,
      gender: "all",
      category: "all",
      subcategory: "all"
    };
  }

  getAllPromos = async () => {
    let promos = [];
    const query = await db.collection("promos").get();

    query.forEach(response => {
      promos.push(response.data());
    });
    this.setState({ promos: promos });
    this.props.setCurrentPromo(promos[0].promoId)
    this.props.setCardIndex({cardIndex: 0, promoId: promos[0].promoId})
  };

  /* -----------------------------------------------------------------------------------------------------
   * FILTER PROMO METHOD
   *
   *
   */

  filterPromos = async (gender, category, subcategory) => {
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

    this.setState({ promos: promos }) 
    this.props.setCurrentPromo(promos[0].promoId)
    this.props.setCardIndex({cardIndex: 0, promoId: promos[0].promoId})
    
  };

  // -----------------------------------------------------------------------------------------------------

  componentDidMount = () => {
    this.getAllPromos();
  };

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  subCategoryFilter = (gender, categories, subCategories) => {
    if (gender == "female" && categories == "vestuario") {
      return (subCategories[0].map((node) => {
        return <Picker.Item label={node.label} value={node.value} key={node.value} />
      })
      )
    } else if (gender == "male" && categories == "vestuario") {
      return (subCategories[1].map((node) => {
        return <Picker.Item label={node.label} value={node.value} key={node.value} />
      })
      )
    } else {
      return
    }
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
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontWeight: "300" }}>Gender</Text>

                <Picker
                  style={{
                    height: 50,
                    width: 200,
                    margin: 25,
                    marginTop: 0
                  }}
                  selectedValue={this.state.gender}
                  onValueChange={(itemValue) =>
                    this.setState({ gender: itemValue })
                  }
                >
                  {genderList.map((node) => {
                    return <Picker.Item label={node.label} value={node.value} key={node.value} />
                  })}
                </Picker>

                <Text style={{ margin: 5, fontSize: 30 }}>
                  Category
                </Text>

                <Picker
                  style={{ height: 50, width: 200, margin: 25, marginTop: 40 }}
                  selectedValue={this.state.category}
                  onValueChange={(itemValue) =>
                    this.setState({ category: itemValue })
                  }
                >
                  {categoryList.map((node) => {
                    return <Picker.Item label={node.label} value={node.value} key={node.value} />
                  })}
                </Picker>

                <Text style={{ margin: 5, fontSize: 30 }}>Subcategory</Text>

                <Picker
                  style={{ height: 50, width: 200, margin: 25, marginTop: 40 }}
                  selectedValue={this.state.subcategory}
                  onValueChange={(itemValue) =>
                    this.setState({ subcategory: itemValue })
                  }
                >
                  {this.subCategoryFilter(this.state.gender, this.state.category, subCategoryList)}
                </Picker>

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
                    borderColor: "#3b5998",
                    backgroundColor: '#3b5998',
                    borderWidth: 1,
                    borderRadius: 5,
                    width: 200,
                    position: "absolute",
                    bottom: -520,

                  }}
                  onPress={() => {
                    this.filterPromos(this.state.gender, this.state.category, this.state.subcategory);
                    this.setModalVisible(!this.state.modalVisible);
                  }}
                >
                  <Text style={{ color: "white" }}>Filter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
        <TouchableOpacity
          style={{ position: "absolute", left: 10, zIndex: 1 }}
          onPress={() => {
            if (this.props.promo.currentPromo != this.props.promo.cardIndex.promoId) {
              this.props.setCurrentPromo(this.props.promo.cardIndex.promoId)
            }
            this.props.navigation.navigate("PromoScreen")
          }}
        >
          <Ionicons style={{ margin: 5 }} name="ios-heart-empty" size={40} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ position: "absolute", right: 10, zIndex: 1 }}
          onPress={() => this.setModalVisible(true)}
        >
          <Ionicons style={{ margin: 5 }} name="ios-search" size={40} />
        </TouchableOpacity>
        <PromoCards promos={this.state.promos} />
        <View style={{ height: 60 }} />
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ setCurrentPromo, setCardIndex }, dispatch);
};

const mapStateToProps = state => {
  return {
    promo: state.promo,
    user: state.user
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
