import React, { Component } from "react"
import { Location, Permissions } from "expo"
import { Text, View, TouchableOpacity, Picker, Modal } from "react-native"
import styles from "../../styles"
import { Ionicons } from "@expo/vector-icons"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import db from "../../config/firebase"
import ENV from "../../env"
import * as geolib from "geolib"
import { genderList, categoryList, subCategoryList } from "../../constants/filters"
import PromoCards from "../../components/PromoCards"
import { setCurrentPromo, setCardIndex } from "../../actions/promo"
import { actualizeLocation, updateCurrentPosition, updateReferencePoint } from "../../actions/user"
import { setNearStores } from "../../actions/nearStores"

const GOOGLE_API = "https://maps.googleapis.com/maps/api/geocode/json"
const DISTANCE_RADIUS = 400
const REFERENCE_DISTANCE = 100

const GEOLOCATION_OPTIONS = {
  accuracy: Location.Accuracy.Highest,
  timeInterval: 2000, //Minimum time to wait between each update in milliseconds
  distanceInterval: 1 // Receive updates only when the location has changed by at least this distance in meters.
};

class Home extends Component {
  constructor() {
    super();
    this.state = {
      lastTap: null,
      firstFetch: true,
      currentIndex: 0,
      promos: [],
      modalVisible: false,
      gender: "all",
      category: "all",
      subcategory: "all",
      //--location
      location: null,
      newLocation: null,
      nearStores: []
    };

  }

  componentDidMount = () => {
    this.googleApi(this.props.user.reference);
    this.setState({ newLocation: this.props.user.reference })
  };

  //----------------- Get Location -----------------------------------------------------

  watchLocation = async () => {
    const permission = await Permissions.askAsync(Permissions.LOCATION);
    if (permission.status === "granted") {
      Location.watchPositionAsync(GEOLOCATION_OPTIONS, this.locationChanged);
    }
  };

  locationChanged = location => {
    if (location) {
      let newLocation = {
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      };
      console.log("CurrentPosition: ", newLocation)


      if (this.props.user.reference) {
        let meters = geolib.getDistance(
          newLocation.coords,
          this.props.user.reference.coords,
          1
        );
        console.log("Distance: ", meters)

        if (meters > REFERENCE_DISTANCE) {
          this.props.user.updateReferencePoint(newLocation)
          if (this.state.firstFetch == true) this.setState({ firstFetch: false })
          console.log("NewReferencePoint ", newLocation)

          this.googleApi(newLocation);

        }
      }



    }
    //this.props.updateCurrentPosition(newLocation)

    /*  this.setState({
       location: location,
       region: region,
       newLocation: newLocation
     });*/

  };

  googleApi = async (newLocation) => {
    const url = `${GOOGLE_API}?latlng=${newLocation.coords.latitude},${newLocation.coords.longitude}&key=${ENV.googleApiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    let country;
    let district;
    let conselho;
    let freguesia;
    for (let i = 0; i < data.results.length; i++) {
      if (data.results[i].types[0] == "administrative_area_level_1") {
        district = data.results[i].formatted_address;
      }
      if (data.results[i].types[0] == "administrative_area_level_2") {
        conselho = data.results[i].formatted_address;
      }
      if (data.results[i].types[0] == "administrative_area_level_3") {
        freguesia = data.results[i].formatted_address;
      }
      if (data.results[i].types[0] == "country") {
        country = data.results[i].formatted_address;
      }
    }

    this.props.actualizeLocation(
      newLocation,
      country,
      district,
      conselho,
      freguesia
    );
    this.getNearStores();
  };

  getNearStores = async () => {
    let stores = [];
    let currentPlace = this.props.user.place
    try {
      //get all stores in the same place as current user
      const query = await db
        .collection("stores")
        .where("place", "==", currentPlace)
        .get();

      query.forEach(response => {
        stores.push(response.data());
      });

      //grab all locations
      let locations = [];
      for (let i = 0; i < stores.length; i++) {
        locations.push(stores[i].storeLocation);
      }
      //get only stores inside the DISTANCE_RADIUS
      let distance = [];
      let nearStores = [];
      for (let j = 0; j < stores.length; j++) {
        let meters = geolib.getDistance(
          this.state.newLocation.coords,
          stores[j].storeLocation.coords,
          1
        );
        distance.push(meters);
        if (meters < DISTANCE_RADIUS) {
          nearStores.push(stores[j]);
        }
      }

      this.props.setNearStores(nearStores)
      this.setState({ nearStores })

      this.getAllPromos()

    } catch (e) {
      console.error(e)
    }

  };


  //----------------- Get Promos -------------------------------------------------------
  getAllPromos = async () => {
    let promos = [];
    if (this.state.nearStores) {
      let nearStores = this.state.nearStores
      console.log("nearstores", nearStores)

      
        nearStores.map( async store => {
         let query = await db.collection("promos").where("storeId", "==", store.storeId).get()
            query.forEach(response => {
              promos.push(response.data());
          })

        }).then(() => {
          if (promos) {
            this.props.setCurrentPromo(promos[0].promoId)
            this.props.setCardIndex({ cardIndex: 0, promoId: promos[0].promoId })
            this.setState({ promos: promos });
          }
        })

      if (this.state.firstFetch == true) {
        this.setState({ firstFetch: false })
        //this.watchLocation();
      }
    }

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
    this.props.setCardIndex({ cardIndex: 0, promoId: promos[0].promoId })

  };

  // -----------------------------------------------------------------------------------------------------


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
  return bindActionCreators({ setCurrentPromo, setCardIndex, actualizeLocation, setNearStores, updateCurrentPosition, updateReferencePoint }, dispatch);
};

const mapStateToProps = state => {
  return {
    promo: state.promo,
    user: state.user,
    nearStores: state.nearStores
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
