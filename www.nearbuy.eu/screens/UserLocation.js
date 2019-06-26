import React, { Component } from 'react';
import styles from '../styles'
import ENV from '../env';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CurrentLocationButton } from './CurrentLocationButton'
import {  Platform, Text, View, StyleSheet } from 'react-native';
import { MapView, Location, Permissions, Constants } from 'expo';

const GEOLOCATION_OPTIONS = { 
    enableHighAccuracy: true,
    timeout: 20000, 
    maximumAge: 1000 
};

class UserLocation extends Component {
    
    state = {
        location: null,
        region: null,
      }

    componentWillMount() {
        this.watchLocation()
    }

    locationChanged = (location) => {
        region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.00422,
          longitudeDelta: 0.00221
        },
        this.setState({location, region})
      }

    watchLocation = async () =>{
        const permission = await Permissions.askAsync(Permissions.LOCATION)
        if(permission.status === 'granted'){
            Location.watchPositionAsync(GEOLOCATION_OPTIONS, this.locationChanged)
        }
    }

    centerMap(){
        const{
          latitude,
          longitude,
          latitudeDelta,
          longitudeDelta} = this.state.region
    
        this.map.animateToRegion({
          latitude,
          longitude,
          latitudeDelta,
          longitudeDelta
        })  
      }

    render() {
    return (
        <View style={styles.container}>
            <CurrentLocationButton cb = {() => {this.centerMap()}}/>
            <MapView
                ref = {(map) => {this.map = map}}
                style={styles.container}
                showsUserLocation={true}
                showsMyLocationButton={true}
                region={this.state.region}
            />
        </View>
    );
  }
}

export default UserLocation