import React, { Component } from 'react';
import styles from '../styles'
import ENV from '../env';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CurrentLocationButton } from './CurrentLocationButton'
import {  Platform, Text, View, StyleSheet } from 'react-native';
import { MapView, Location, Permissions, Constants } from 'expo';
import { actualizeLocation } from '../actions/user'
import geolib from 'geolib'
import { Marker } from 'react-native-maps';

const GEOLOCATION_OPTIONS = { 
    enableHighAccuracy: true,
    timeout: 20000,
    distanceInterval: 0, 
    //maximumAge: 1000 
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
        this.setState({location: location, region: region})
        
        let newLocation = {
          coords: {
            latitude: region.latitude,
            longitude: region.longitude
          }
        }
        console.log(newLocation)
        this.props.actualizeLocation(newLocation)
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
          longitudeDelta
        } = this.state.region
    
        this.map.animateToRegion({
          latitude,
          longitude,
          latitudeDelta,
          longitudeDelta
        })  
      }

      getNearUsers = () => {
        //fetch all users from the table, and compare the distance between current position and friend position
        //displays only the friends inside a radius of 10 meters.
        geolib.getDistance(newLocation.coords, friendLocation.coords, 1)
      }


  render() {
      let text = JSON.stringify(this.state.region)
    return (
        <View style={styles.container}>
          <Text>{text}</Text>
            <CurrentLocationButton cb = {() => {this.centerMap()}}/>
            <MapView
                ref = {(map) => {this.map = map}}
                style={styles.container}
                showsUserLocation={true}
                showsMyLocationButton={true}
                region={this.state.region}
            />
        <Marker region={this.state.region}>
          <View style={{backgroundColor: "red", padding: 10}}>
            <Text>FRIEND</Text>
          </View>
        </Marker>
        </View>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ actualizeLocation }, dispatch)
}

const mapStateToProps = (state) => {
  return { 
    user: state.user
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserLocation)