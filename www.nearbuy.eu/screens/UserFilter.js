import React, { Component } from 'react';
import { Text, View, Image, Animated, Dimensions, PanResponder, TouchableOpacity, PixelRatio } from 'react-native';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import styles from '../styles'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

class UserFilter extends Component {

    render() {
        return (
            <View>
                <Text>Filter</Text>
            </View>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({}, dispatch)
}

const mapStateToProps = (state) => {
    return { 
      user: state.user
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserFilter);