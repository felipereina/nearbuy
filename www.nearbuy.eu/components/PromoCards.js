import React, { Component } from "react";
import {
    Text,
    View,
    Image,
    Animated,
    Dimensions,
    PanResponder } from "react-native";

import styles from "../styles";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

class PromoCards extends Component {
    constructor() {
        super()
        this.state = {
            currentIndex: 0,
        }
        this.position = new Animated.ValueXY();
        this.rotate = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: ["-10deg", "0deg", "10deg"],
            extrapolate: "clamp"
        });

        this.rotateAndTranslate = {
            transform: [
                { rotate: this.rotate },
                ...this.position.getTranslateTransform()
            ]
        };

        this.likeOpacity = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [0, 0, 1],
            extrapolate: "clamp"
        });

        this.dislikeOpacity = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [1, 0, 0],
            extrapolate: "clamp"
        });

        this.nextCardOpacity = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [1, 0, 1],
            extrapolate: "clamp"
        });

        this.nextCardScale = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [1, 0.8, 1],
            extrapolate: "clamp"
        });

    }

    componentWillMount = () => {
        this.PanResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onPanResponderMove: (evt, gestureState) => {
                this.position.setValue({ x: gestureState.dx, y: gestureState.dy });
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dx > 120) {
                    Animated.spring(this.position, {
                        toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy }
                    }).start(() => {
                        this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
                            this.position.setValue({ x: 0, y: 0 });
                        });
                    });
                } else if (gestureState.dx < -120) {
                    Animated.spring(this.position, {
                        toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy }
                    }).start(() => {
                        this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
                            this.position.setValue({ x: 0, y: 0 });
                        });
                    });
                } else {
                    Animated.spring(this.position, {
                        toValue: { x: 0, y: 0 },
                        friction: 4
                    }).start();
                }
            }
        });
    };

    renderPromos = promos => {
        return promos
            .map((item, i) => {
                if (i < this.state.currentIndex) {
                    return null;
                } else if (i == this.state.currentIndex) {
                    return (
                        <Animated.View
                            {...this.PanResponder.panHandlers}
                            key={item.promoId}
                            style={[
                                this.rotateAndTranslate,
                                {
                                    height: SCREEN_HEIGHT - 120,
                                    width: SCREEN_WIDTH,
                                    padding: 10,
                                    position: "absolute"
                                }
                            ]}
                        >
                            <Animated.View
                                key={item.promoId + "like"}
                                style={{
                                    opacity: this.likeOpacity,
                                    transform: [{ rotate: "-30deg" }],
                                    position: "absolute",
                                    top: 50,
                                    left: 40,
                                    zIndex: 1000
                                }}
                            >
                                <Text
                                    style={{
                                        borderWidth: 1,
                                        borderColor: "green",
                                        color: "green",
                                        fontSize: 32,
                                        fontWeight: "800",
                                        padding: 10
                                    }}
                                >
                                    LIKE
                    </Text>
                            </Animated.View>
                            <Animated.View
                                key={item.promoId + "nope"}
                                style={{
                                    opacity: this.dislikeOpacity,
                                    transform: [{ rotate: "30deg" }],
                                    position: "absolute",
                                    top: 50,
                                    right: 40,
                                    zIndex: 1000
                                }}
                            >
                                <Text
                                    style={{
                                        borderWidth: 1,
                                        borderColor: "red",
                                        color: "red",
                                        fontSize: 32,
                                        fontWeight: "800",
                                        padding: 10
                                    }}
                                >
                                    NOPE
                    </Text>
                            </Animated.View>
                            <Animated.View
                                key={item.promoId + "oldPrice"}
                                style={{
                                    position: "absolute",
                                    bottom: 30,
                                    left: 40,
                                    zIndex: 1000
                                }}
                            >
                                <Text
                                    style={{
                                        textDecorationLine: "line-through",
                                        textDecorationStyle: "solid",
                                        color: "red",
                                        fontSize: 20,
                                        fontWeight: "400",
                                        padding: 10
                                    }}
                                >
                                    $ {item.oldPrice}
                                </Text>
                            </Animated.View>
                            <Animated.View
                                key={item.promoId + "newPrice"}
                                style={{
                                    position: "absolute",
                                    bottom: 30,
                                    right: 40,
                                    zIndex: 1000
                                }}
                            >
                                <Text
                                    style={{
                                        borderWidth: 1,
                                        borderColor: "green",
                                        color: "green",
                                        backgroundColor: "white",
                                        opacity: 0.75,
                                        fontSize: 20,
                                        fontWeight: "400",
                                        padding: 10
                                    }}
                                >
                                    $ {item.newPrice}
                                </Text>
                            </Animated.View>
                            <Animated.View
                                key={item.promoId + "percentage"}
                                style={{
                                    position: "absolute",
                                    bottom: 70,
                                    right: 20,
                                    zIndex: 1000
                                }}
                            >
                                <Text
                                    style={{
                                        borderWidth: 1,
                                        color: "white",
                                        borderColor: "red",
                                        backgroundColor: "red",
                                        fontSize: 12,
                                        fontWeight: "200",
                                        padding: 5
                                    }}
                                >
                                    {item.percentage}%
                    </Text>
                            </Animated.View>
                            <View
                                key={item.promoId + "titleview"}
                                style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flex: 0.1,
                                    flexDirection: "row"
                                }}
                            >
                                <Text
                                    key={item.promoId + "title"}
                                    style={{ fontWeight: "800", padding: 3 }}
                                >
                                    {item.title}
                                </Text>
                                
                            </View>
                            <Image
                                key={item.promoId + "promoImage"}
                                style={{
                                    flex: 1,
                                    height: null,
                                    width: null,
                                    resizeMode: "cover",
                                    borderRadius: 20
                                }}
                                source={{ uri: item.promoPhoto }}
                            />
                        </Animated.View>
                    );
                } else {
                    return (
                        <Animated.View
                            key={item.promoId}
                            style={[
                                {
                                    opacity: this.nextCardOpacity,
                                    transform: [{ scale: this.nextCardScale }],
                                    height: SCREEN_HEIGHT - 120,
                                    width: SCREEN_WIDTH,
                                    padding: 10,
                                    position: "absolute"
                                }
                            ]}
                        >
                            <Image
                                key={item.promoId + "promoImage"}
                                style={{
                                    flex: 1,
                                    height: null,
                                    width: null,
                                    resizeMode: "cover",
                                    borderRadius: 20
                                }}
                                source={item.uri}
                            />
                        </Animated.View>
                    );
                }
            })
            .reverse();
    };

    render() {
        return (
            <View style={styles.container}>
                {this.renderPromos(this.props.promos)}
            </View>
        );
    }
}

export default PromoCards