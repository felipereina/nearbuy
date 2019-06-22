import React, { Component } from 'react';
import { Text, View, Image, FlatList, TouchableOpacity } from 'react-native';
import styles from '../styles'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
/* import { getPosts, likePost, unlikePost } from '../actions/post'
import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment' */


class Home extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Home</Text>
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({}, dispatch)
}

const mapStateToProps = (state) => {
    return { obj: state}
}

export default connect(mapStateToProps)(Home);