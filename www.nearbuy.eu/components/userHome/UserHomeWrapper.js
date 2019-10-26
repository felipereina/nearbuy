import React, { Component } from "react";
import ENV from "../env";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Location, Permissions } from "expo";
import { actualizeLocation } from "../actions/user";
import { setNearStores } from "../actions/nearStores"
import * as geolib from "geolib";
import db from "../config/firebase";

const GOOGLE_API = "https://maps.googleapis.com/maps/api/geocode/json";
const DISTANCE_RADIUS = 400;

const GEOLOCATION_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 20000,
    distanceInterval: 2
};

class UserHomeWrapper extends Component {
    
    constructor() {
        super()
        state = {
            location: null,
            region: null,
            newLocation: null,
            currentPromoLocation: null,
        };
    }

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

        this.props.setNearStores(nearStores);

    };

    render() {
        return null
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ setNearStores, actualizeLocation }, dispatch);
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
)(UserHomeWrapper);
