import React, { Component } from 'react';
import { Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import styles from '../styles'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { updateStoreEmail, updateStorePassword, loginStore, getStore } from '../actions/store'
import firebase from 'firebase'

class StoreLogin extends Component {

     componentDidMount = () =>{
      firebase.auth().onAuthStateChanged((store) => {
        if(store){
          this.props.getStore(store.uid, 'LOGIN_STORE')
          if(this.props.store != null){
            this.props.navigation.navigate('StoreHome')
          }
        }
      })
    } 

  render() {
    return (
       <View style={[styles.container, styles.center]}>
        <Image style={{width: 200, height: 200}} source={require('../assets/logo1.png')} />
        <Text>STORE</Text>
        <TextInput 
            style={styles.border}
            value={this.props.store.email}
            onChangeText={input => this.props.updateStoreEmail(input)}
            placeholder='Email'
        />
        <TextInput
            style={styles.border} 
            value={this.props.store.password}
            onChangeText={input => this.props.updateStorePassword(input)}
            placeholder='Password'
            secureTextEntry={true}
        />
         <TouchableOpacity style={styles.button} onPress={() => this.props.loginStore()}>
            <Text>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => this.props.navigation.navigate('StoreSignup')}>
            <Text>SignUp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.storeButton]} onPress={() =>  this.props.navigation.navigate('Login')}>
            <Text>I am a User</Text>
        </TouchableOpacity>
      </View> 
    );
  }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({updateStoreEmail, updateStorePassword, loginStore, getStore}, dispatch)
}

const mapStateToProps = (state) => {
    return { store: state.store}
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreLogin);