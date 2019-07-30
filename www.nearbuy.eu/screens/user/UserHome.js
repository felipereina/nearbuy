import React, { Component } from 'react';
import { Text, View, Image, Animated, Dimensions, PanResponder, TouchableOpacity, Picker, Modal } from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import styles from '../../styles'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import db from '../../config/firebase'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width
const Promos = [
  {id: '1', gender: 'female', category: 'sapatos', subcategory: 'sapatilhas', title: 'sapatilhas chunky tecnicas as cores', oldPrice:'35,99', newPrice: '12,99', percentage:'-64%', uri: require('../../assets/promo1.jpg')},
  {id: '2', gender: 'female', category: 'vestuario', subcategory: 'fatos de banho', title: 'Fato de banho as riscas laranjas', oldPrice:'19,99', newPrice: '7,99', percentage:'-60%', uri: require('../../assets/promo2.jpg')},
  {id: '3', gender: 'female', category: 'vestuario', subcategory: 'vestidos', title: 'Vestido comprido em crepe', oldPrice:'15,99', newPrice: '5,99', percentage:'-63%', uri: require('../../assets/promo3.jpg')},
  {id: '4', gender: 'female', category: 'vestuario', subcategory: 'jardineiras e macacoes', title: 'Jardineiras de ganga brancas', oldPrice:'19,99', newPrice: '12,99', percentage:'-35%', uri: require('../../assets/promo4.jpg')},
  {id: '5', gender: 'female', category: 'sapatos', subcategory: 'cunhas e plataformas', title: 'Cunha de juta com tie-dye', oldPrice:'25,99', newPrice: '12,99', percentage:'-50%', uri: require('../../assets/promo5.jpg')},
]

class Home extends Component {

  constructor(){
    super()

    this.position = new Animated.ValueXY()
    this.state={
      currentIndex: 0,
      promos: [],
      modalVisible: false,
      language: 'Java'
    }
    this.rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH/2, 0, SCREEN_WIDTH/2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp'
    })

    this.rotateAndTranslate = {
      transform: [
        {rotate: this.rotate},
        ...this.position.getTranslateTransform()
      ]
    }

    this.likeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH/2, 0, SCREEN_WIDTH/2],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp'
    })

    this.dislikeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH/2, 0, SCREEN_WIDTH/2],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp'
    })

    this.nextCardOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH/2, 0, SCREEN_WIDTH/2],
      outputRange: [1, 0, 1],
      extrapolate: 'clamp'
    })

    this.nextCardScale = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH/2, 0, SCREEN_WIDTH/2],
      outputRange: [1, 0.8, 1],
      extrapolate: 'clamp'
    })

  }

  getAllPromos = async () => {
    let promos = []
    const query = await db.collection('promos').get()
        
    query.forEach((response) => {
      promos.push(response.data())
    })
    console.log("ALL PROMOS:")
    console.log(promos)
    this.setState({promos: promos})
  }

  filterPromos = async (gender, category) => {
    let promos = []
    const query = await db.collection('promos').where('gender', '==', gender).where('category', '==', category).get()
        
    query.forEach((response) => {
      promos.push(response.data())
    })
    console.log("FILTERED PROMOS:")
    console.log(promos)
    this.setState({promos: promos})
  }


  componentWillMount= () =>{

    this.getAllPromos()

    this.PanResponder = PanResponder.create({

      onStartShouldSetPanResponder:(evt, gestureState) => true,
      onPanResponderMove:(evt, gestureState) => {
        this.position.setValue({x: gestureState.dx, y: gestureState.dy})
      },
      onPanResponderRelease:(evt, gestureState) => {
        
        if(gestureState.dx > 120) {
          Animated.spring(this.position, {
            toValue: {x: SCREEN_WIDTH + 100, y: gestureState.dy }
          }).start(() => {
            this.setState({currentIndex: this.state.currentIndex + 1}, () => {
              this.position.setValue({x: 0, y: 0})
            })
          })
        } else if( gestureState.dx < -120) {
          Animated.spring(this.position, {
            toValue: {x: -SCREEN_WIDTH - 100, y: gestureState.dy }
          }).start(() => {
            this.setState({currentIndex: this.state.currentIndex + 1}, () => {
              this.position.setValue({x: 0, y: 0})
            })
          })
        } else {
          Animated.spring(this.position, {
            toValue: {x: 0, y: 0},
            friction: 4
          }).start()
        }
      }

    })
  }

  renderPromos = (promos) =>{
    return promos.map((item, i) => {

      if(i < this.state.currentIndex){
        return null
      } else if ( i == this.state.currentIndex){
//this.getPromos('female', 'vestuario', 'jardineiras e macacoes')
      return (
        <Animated.View 
          {...this.PanResponder.panHandlers}
          key={item.promoId} style={[this.rotateAndTranslate, {height: SCREEN_HEIGHT - 120, width: SCREEN_WIDTH, padding: 10, position: 'absolute'}]}>

            <Animated.View style={{opacity: this.likeOpacity, transform: [{rotate: '-30deg'}], position: 'absolute', top: 50, left: 40, zIndex: 1000}}>
              <Text style={{borderWidth: 1, borderColor: 'green', color: 'green', fontSize: 32, fontWeight: '800', padding: 10}}
              >LIKE</Text>
            </Animated.View>
            <Animated.View style={{opacity: this.dislikeOpacity, transform: [{rotate: '30deg'}], position: 'absolute', top: 50, right: 40, zIndex: 1000}}>
              <Text style={{borderWidth: 1, borderColor: 'red', color: 'red', fontSize: 32, fontWeight: '800', padding: 10}}
              >NOPE</Text>
            </Animated.View>
            <Animated.View style={{position: 'absolute', bottom: 30, left: 40, zIndex: 1000}}>
              <Text style={{textDecorationLine: 'line-through', textDecorationStyle:'solid', color: 'red', fontSize: 20, fontWeight: '400', padding: 10}}
              >$ {item.oldPrice}</Text>
            </Animated.View>
            <Animated.View style={{position: 'absolute', bottom: 30, right: 40, zIndex: 1000}}>
              <Text style={{borderWidth: 1, borderColor: 'green', color: 'green', backgroundColor: 'white', opacity: 0.75, fontSize: 20, fontWeight: '400', padding: 10}}
              >$ {item.newPrice}</Text>
            </Animated.View>
            <Animated.View style={{position: 'absolute', bottom: 70, right: 20, zIndex: 1000}}>
              <Text style={{borderWidth: 1, color: 'white', borderColor: 'red', backgroundColor: 'red', fontSize: 12, fontWeight: '200', padding: 5}}
              >{item.percentage}%</Text>
            </Animated.View>
            <View style={{justifyContent: 'center', alignItems: 'center', flex: 0.1, flexDirection: 'row'}}>
              <Text style={{fontWeight: '800', padding: 3}}>{item.title}</Text>
              <TouchableOpacity style={{position: 'absolute', right: 10}} onPress={() => this.setModalVisible(true)}>
                  <Ionicons style={{margin: 5}} name='ios-search' size={40}/>
              </TouchableOpacity>
            </View>
            <Image 
              style={{flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 20}}
              source={{uri: item.promoPhoto}}
              />
          </Animated.View>
      )
      }else {
        return (
        <Animated.View 
          key={item.id} style={[{opacity: this.nextCardOpacity, transform: [{scale: this.nextCardScale}], height: SCREEN_HEIGHT - 120, width: SCREEN_WIDTH, padding: 10, position: 'absolute'}]}>
            <Image 
              style={{flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 20}}
              source={item.uri}
              />
          </Animated.View>
        )
      }
    }).reverse()
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{marginTop: 22}}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.')
          }}>
          <View style={{marginTop: 22}}>
            <View>
            <Picker
              selectedValue={this.state.language}
              style={{height: 50, width: 100}}
              onValueChange={(itemValue, itemIndex) =>
              this.setState({language: itemValue})
              }>
              <Picker.Item label="Java" value="java" />
              <Picker.Item label="JavaScript" value="js" />
            </Picker>

              <TouchableOpacity style={[styles.center, styles.button]}
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible)
                  this.filterPromos('female', 'vestuario')
                }}>
                <Text>Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        </View>

        <View style={styles.container}>
          {this.renderPromos(this.state.promos)}
        </View>
        <View style={{height:60}}>
        </View>
      </View>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({}, dispatch)
}

const mapStateToProps = (state) => {
    return { 
      post: state.post,
      user: state.user
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);