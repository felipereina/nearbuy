import React, { Component } from "react";
import styles from "../../styles";
import ENV from "../../env";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CurrentLocationButton } from "../../components/CurrentLocationButton";
import { Text, View } from "react-native";
import { Location, Permissions } from "expo";
import MapView, { Polyline } from "react-native-maps"
import { actualizeLocation } from "../../actions/user";
import * as geolib from "geolib";
import db from "../../config/firebase";
import PolyLine from "@mapbox/polyline"

const GOOGLE_API = "https://maps.googleapis.com/maps/api/geocode/json";
const DISTANCE_RADIUS = 400;

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 20000,
  distanceInterval: 2
};

class UserLocation extends Component {
  state = {
    location: null,
    region: null,
    newLocation: null,
    currentPromoLocation: null,
    markers: [],
    pointCoords: [],
  };

  componentDidMount() {
    this.watchLocation();
    this.getNearStores();   
    this.getCurrentPromoStore()
     
  }

  locationChanged = location => {
    region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.00422,
      longitudeDelta: 0.00221
    };

    let newLocation = {
      coords: {
        latitude: region.latitude,
        longitude: region.longitude
      }
    };

    this.setState({
      location: location,
      region: region,
      newLocation: newLocation
    });
    this.googleApi(
      newLocation.coords.latitude,
      newLocation.coords.longitude,
      newLocation
    );
  };

  googleApi = async (lat, lng, newLocation) => {
    const url = `${GOOGLE_API}?latlng=${lat},${lng}&key=${ENV.googleApiKey}`;
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
  };


  watchLocation = async () => {
    const permission = await Permissions.askAsync(Permissions.LOCATION);
    if (permission.status === "granted") {
      Location.watchPositionAsync(GEOLOCATION_OPTIONS, this.locationChanged);
    }
  };

  centerMap() {
    const {
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta
    } = this.state.region;

    this.map.animateToRegion({
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta
    });
  }

  getNearStores = async () => {
    let stores = [];
    //get current user
    const currentUser = await db
      .collection("users")
      .doc(this.props.user.uid)
      .get();
    //get current user place
    const currentPlace = currentUser.data().place;

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
    //get only stores inside the radius
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
    
    //show near stores as markers on the map
    this.setMarkers(nearStores);
  };

  setMarkers = markers => {
    this.setState({ markers: markers });
  };

  getCurrentPromoStore = async () =>{
    promoUid = this.props.promo.currentPromo
    let storeId = "";
    let query = await db.collection("promos").where("promoId", "==", promoUid).get();
      query.forEach(response => {
        
        storeId = response.data().storeId
      });

      let storeQuery = await db.collection("stores").where("storeId", "==", storeId).get();
      storeQuery.forEach(response => {
        this.setState({ currentPromoLocation: response.data().storeLocation })
      });

      this.getRouteDirections()

  }

  //show walking route from currentUser to promo store adress
  getRouteDirections = async () => {
     try{
      const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.newLocation.coords.latitude},${this.state.newLocation.coords.longitude}&destination=${this.state.currentPromoLocation.coords.latitude},${this.state.currentPromoLocation.coords.longitude}&mode=walking&key=${ENV.googleApiKey}`)
      const json = await response.json()
      const points = PolyLine.decode(json.routes[0].overview_polyline.points)
      const pointCoords = points.map( point => {
        return {latitude: point[0], longitude: point[1]}
      })
      this.setState({pointCoords})

    } catch(e){
      console.error(e)
    }
  }

  render() {
    
    if(this.state.pointCoords){
    return (
      <View style={styles.container}>
        <CurrentLocationButton
          cb={() => {
            this.centerMap();
          }}
        />
        <MapView
          ref={map => {
            this.map = map;
          }}
          style={styles.container}
          showsUserLocation={true}
          showsMyLocationButton={true}
          region={this.state.region}
        >
          {this.state.markers.map(marker => {
            return (
              <MapView.Marker key={marker.storeId} coordinate={marker.storeLocation.coords} title={marker.storename} />
            );
          })}
            <Polyline 
            coordinates={this.state.pointCoords}
            strokeWidth={4}
            strokeColor= "red"
            lineJoin= "round"
          /> 
        </MapView>
      </View>
    );
        } else{
          return null
        }
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ actualizeLocation }, dispatch);
};

const mapStateToProps = state => {
  return {
    user: state.user,
    promo: state.promo
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserLocation);
