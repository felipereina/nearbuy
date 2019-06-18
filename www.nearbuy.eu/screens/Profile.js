import React, { Component } from 'react';
import { Text, View } from 'react-native';
import styles from '../styles'
import { connect } from 'react-redux'


class Profile extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Profile</Text>
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

export default connect(mapStateToProps)(Profile);