import React, { Component } from "react";
import { Location, Permissions } from "expo";
import { Text, View, TouchableOpacity, Picker, Modal } from "react-native";
import styles from "../../styles";
import { Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import db from "../../config/firebase";
import ENV from "../../env";
import * as geolib from "geolib";
import {
  genderList,
  categoryList,
  subCategoryList
} from "../../constants/filters";
import PromoCards from "../../components/PromoCards";
import { setCurrentPromo, setCardIndex } from "../../actions/promo";
import { actualizeLocation } from "../../actions/user";
import {
  updateCurrentPosition,
  updateReferencePoint
} from "../../actions/position";
import { setNearStores } from "../../actions/nearStores";
import geohash from "ngeohash";

const GOOGLE_API = "https://maps.googleapis.com/maps/api/geocode/json";
const DISTANCE_RADIUS = 400;
const REFERENCE_DISTANCE = 100;

const GEOLOCATION_OPTIONS = {
  accuracy: Location.Accuracy.Highest,
  timeInterval: 2000, //Minimum time to wait between each update in milliseconds
  distanceInterval: 1 // Receive updates only when the location has changed by at least this distance in meters.
};

const GOOGLE_API = "https://maps.googleapis.com/maps/api/geocode/json";
const DISTANCE_RADIUS = 400;
const REFERENCE_DISTANCE = 20;

const GEOLOCATION_OPTIONS = {
  accuracy: Location.Accuracy.Highest,
  timeInterval: 2000, //Minimum time to wait between each update in milliseconds
  distanceInterval: 1 // Receive updates only when the location has changed by at least this distance in meters.
};

class Home extends Component {
  constructor() {
    super();
    this.state = {
      firstRender: true,
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
    this.getCurrentArea(this.props.position.reference);
  };

  //----------------- Get Location -----------------------------------------------------

  watchLocation = async () => {
    const permission = await Permissions.askAsync(Permissions.LOCATION);
    if (permission.status === "granted") {
      Location.watchPositionAsync(GEOLOCATION_OPTIONS, this.locationChanged);
    }
  };

  locationChanged = location => {

    let newLocation = {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }
    };
    console.log("ReferencePosition:", this.props.position.reference)
    console.log("CurrentPosition: ", newLocation);

    let meters = geolib.getDistance(
      newLocation.coords,
      this.props.position.reference.coords,
      1
    );
    console.log("Distance: ", meters);

    if (meters > REFERENCE_DISTANCE) {
      this.props.updateReferencePoint(newLocation);
      console.log("NewReferencePoint ", newLocation);
      console.log(">>>NEW DATABASE CALL<<<");
      this.getCurrentArea(newLocation);
    }

  }

  getCurrentArea = async newLocation => {
    console.log("new Location", newLocation);
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

  const range = this.getGeohashRange(this.props.position.reference.coords.latitude, this.props.position.reference.coords.longitude, 0.2486); //400 metros
  let nearPromos = []
  db
    .collection("promos")
    .where("geohash", ">=", range.lower)
    .where("geohash", "<=", range.upper)
    .onSnapshot(snapshot => {
      // Your own custom logic here
      snapshot.docs.forEach( promo =>{
        console.log("NearPromo: ",promo.data())
        nearPromos.push(promo.data())
      })
        console.log("NearPromos", nearPromos)
        this.props.setCurrentPromo(nearPromos[0].promoId);
        this.props.setCardIndex({ cardIndex: 0, promoId: nearPromos[0].promoId });
        this.setState({
          promos: nearPromos
        })
        console.log(">>>ALL NEARPROMOS LIST<<<",this.state.promos)
        if(this.state.firstRender){
          this.watchLocation()
          this.setState({firstRender: false})
        }
      
    })

   /*  this.props.actualizeLocation(
      newLocation,
      country,
      district,
      conselho,
      freguesia
    ); */

   // this.getNearPromos();
  };

  // Calculate the upper and lower boundary geohashes for
// a given latitude, longitude, and distance in miles
getGeohashRange = (latitude,longitude, distance ) => {
  const lat = 0.0144927536231884; // degrees latitude per mile (1 609.344 meters)
  const lon = 0.0181818181818182; // degrees longitude per mile (1 609.344 meters)

  const lowerLat = latitude - lat * distance;
  const lowerLon = longitude - lon * distance;

  const upperLat = latitude + lat * distance;
  const upperLon = longitude + lon * distance;

  const lower = geohash.encode(lowerLat, lowerLon);
  const upper = geohash.encode(upperLat, upperLon);

  return {
    lower,
    upper
  };
};


  getNearPromos = async () => {
    let promos = [];
    let currentPlace = this.props.user.place;

    //get all stores in the same place as current user
    db.collection("promos")
      .where("place", "==", currentPlace)
      .get().then(result => {

        result.forEach(snapshot => {
          promos.push(snapshot.data());
        })
        return promos
      }).then(promos => {

        console.log("RegionPromos", promos)

        let distance = [];
        let nearPromos = [];

        promos.forEach(promo => {
          let meters = geolib.getDistance(
            this.props.position.reference.coords,
            promo.storeLocation.coords,
            1
          );
          console.log("METERS", meters)
          //get only stores inside the DISTANCE_RADIUS
          distance.push(meters);
          if (meters < DISTANCE_RADIUS) {
            nearPromos.push(promo);
          }
        })
        console.log("NearPromos", nearPromos)
        this.props.setCurrentPromo(nearPromos[0].promoId);
        this.props.setCardIndex({ cardIndex: 0, promoId: nearPromos[0].promoId });
        this.setState({
          promos: nearPromos
        })
        console.log(">>>ALL NEARPROMOS LIST<<<",this.state.promos)
        if(this.state.firstRender){
          this.watchLocation()
          this.setState({firstRender: false})
        }
      })
  }

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

    this.setState({ promos: promos });
    this.props.setCurrentPromo(promos[0].promoId);
    this.props.setCardIndex({ cardIndex: 0, promoId: promos[0].promoId });
  };

  // -----------------------------------------------------------------------------------------------------

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  subCategoryFilter = (gender, categories, subCategories) => {
    if (gender == "female" && categories == "vestuario") {
      return subCategories[0].map(node => {
        return (
          <Picker.Item label={node.label} value={node.value} key={node.value} />
        );
      });
    } else if (gender == "male" && categories == "vestuario") {
      return subCategories[1].map(node => {
        return (
          <Picker.Item label={node.label} value={node.value} key={node.value} />
        );
      });
    } else {
      return;
    }
  };

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
                  onValueChange={itemValue =>
                    this.setState({ gender: itemValue })
                  }
                >
                  {genderList.map(node => {
                    return (
                      <Picker.Item
                        label={node.label}
                        value={node.value}
                        key={node.value}
                      />
                    );
                  })}
                </Picker>

                <Text style={{ margin: 5, fontSize: 30 }}>Category</Text>

                <Picker
                  style={{ height: 50, width: 200, margin: 25, marginTop: 40 }}
                  selectedValue={this.state.category}
                  onValueChange={itemValue =>
                    this.setState({ category: itemValue })
                  }
                >
                  {categoryList.map(node => {
                    return (
                      <Picker.Item
                        label={node.label}
                        value={node.value}
                        key={node.value}
                      />
                    );
                  })}
                </Picker>

                <Text style={{ margin: 5, fontSize: 30 }}>Subcategory</Text>

                <Picker
                  style={{ height: 50, width: 200, margin: 25, marginTop: 40 }}
                  selectedValue={this.state.subcategory}
                  onValueChange={itemValue =>
                    this.setState({ subcategory: itemValue })
                  }
                >
                  {this.subCategoryFilter(
                    this.state.gender,
                    this.state.category,
                    subCategoryList
                  )}
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
                    backgroundColor: "#3b5998",
                    borderWidth: 1,
                    borderRadius: 5,
                    width: 200,
                    position: "absolute",
                    bottom: -520
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
                  <Text style={{ color: "white" }}>Filter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
        <TouchableOpacity
          style={{ position: "absolute", left: 10, zIndex: 1 }}
          onPress={() => {
            if (
              this.props.promo.currentPromo !=
              this.props.promo.cardIndex.promoId
            ) {
              this.props.setCurrentPromo(this.props.promo.cardIndex.promoId);
            }
            this.props.navigation.navigate("PromoScreen");
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
  return bindActionCreators(
    {
      setCurrentPromo,
      setCardIndex,
      actualizeLocation,
      setNearStores,
      updateCurrentPosition,
      updateReferencePoint
    },
    dispatch
  );
};

const mapStateToProps = state => {
  return {
    promo: state.promo,
    user: state.user,
    nearStores: state.nearStores,
    position: state.position
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
