import React, { Component } from "react";
import styles from "../../styles";
import ENV from "../../env";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CurrentLocationButton } from "../../components/CurrentLocationButton";
import { Text, View } from "react-native";
import { MapView, Location, Permissions } from "expo";
import { actualizeLocation } from "../../actions/user";
import * as geolib from "geolib";
import db from "../../config/firebase";
const GOOGLE_API = "https://maps.googleapis.com/maps/api/geocode/json";

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
    markers: []
  };

  componentWillMount() {
    this.watchLocation();
    this.getNearUsers();
  }

  componentDidMount() {}

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

  getNearUsers = () => {
    //fetch all users from the table, and compare the distance between current position and friend position
    //displays only the friends inside a radius of 10 meters.
    geolib.getDistance(newLocation.coords, friendLocation.coords, 1);
  };

  getNearUsers = async () => {
    let users = [];
    //get current user
    const currentUser = await db
      .collection("users")
      .doc(this.props.user.uid)
      .get();
    //get current user place
    const currentPlace = currentUser.data().place;

    //get all users in the same place as current user
    const query = await db
      .collection("users")
      .where("place", "==", currentPlace)
      .get();

    query.forEach(response => {
      users.push(response.data());
    });

    //grab all locations
    let locations = [];
    for (let i = 0; i < users.length; i++) {
      locations.push(users[i].location);
    }
    //get only users inside the radius of 200 meters
    let distance = [];
    let nearUsers = [];
    for (let j = 0; j < locations.length; j++) {
      let meters = geolib.getDistance(
        this.state.newLocation.coords,
        locations[j].coords,
        1
      );
      distance.push(meters);
      if (meters < 200) {
        nearUsers.push(locations[j]);
      }
    }
    //show near users as markers on the map
    this.setMarkers(nearUsers);
  };

  setMarkers = markers => {
    this.setState({ markers: markers });
  };

  render() {
    let text = JSON.stringify(this.state.region);

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
              <MapView.Marker key={marker.coords} coordinate={marker.coords} />
            );
          })}
        </MapView>
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ actualizeLocation }, dispatch);
};

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserLocation);
