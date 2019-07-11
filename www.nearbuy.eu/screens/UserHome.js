import React, { Component } from 'react';
import { Text, View, Image, Animated, Dimensions, PanResponder } from 'react-native';
import styles from '../styles'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width
const Promos = [
  {id: '1', title: 'sapatilhas chunky tecnicas as cores', oldPrice:'35,99', newPrice: '12,99', uri: require('../assets/promo1.jpg')},
  {id: '2', title: 'Fato de banho as riscas laranjas', oldPrice:'19,99', newPrice: '7,99', uri: require('../assets/promo2.jpg')},
  {id: '3', title: 'Vestido comprido em crepe', oldPrice:'15,99', newPrice: '5,99', uri: require('../assets/promo3.jpg')},
  {id: '4', title: 'Jardineiras de ganga brancas', oldPrice:'19,99', newPrice: '12,99', uri: require('../assets/promo4.jpg')},
]

class Home extends Component {

  constructor(){
    super()

    this.position = new Animated.ValueXY()
    this.state={
      currentIndex: 0
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


  componentWillMount= () =>{
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

  renderPromos = () =>{
    return Promos.map((item, i) => {

      if(i < this.state.currentIndex){
        return null
      } else if ( i == this.state.currentIndex){

      return (
        <Animated.View 
          {...this.PanResponder.panHandlers}
          key={item.id} style={[this.rotateAndTranslate, {height: SCREEN_HEIGHT - 120, width: SCREEN_WIDTH, padding: 10, position: 'absolute'}]}>

            <Animated.View style={{opacity: this.likeOpacity, transform: [{rotate: '-30deg'}], position: 'absolute', top: 50, left: 40, zIndex: 1000}}>
              <Text style={{borderWidth: 1, borderColor: 'green', color: 'green', fontSize: 32, fontWeight: '800', padding: 10}}
              >LIKE</Text>
            </Animated.View>
            <Animated.View style={{opacity: this.dislikeOpacity, transform: [{rotate: '30deg'}], position: 'absolute', top: 50, right: 40, zIndex: 1000}}>
              <Text style={{borderWidth: 1, borderColor: 'red', color: 'red', fontSize: 32, fontWeight: '800', padding: 10}}
              >NOPE</Text>
            </Animated.View>

            <Image 
              style={{flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 20}}
              source={item.uri}
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

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          {this.renderPromos()}
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