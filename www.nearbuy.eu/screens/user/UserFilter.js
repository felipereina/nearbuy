import React, { Component } from "react";
import { Text, View } from "react-native";
import styles from "../../styles";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

class UserFilter extends Component {
  render() {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={this.state.modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
        <View style={{ marginTop: 22 }}>
          <View>
            <Picker
              selectedValue={this.state.language}
              style={{ height: 50, width: 100 }}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({ language: itemValue })
              }
            >
              <Picker.Item label="Java" value="java" />
              <Picker.Item label="JavaScript" value="js" />
            </Picker>

            <TouchableOpacity
              style={[styles.center, styles.button]}
              onPress={() => {
                this.setModalVisible(!this.state.modalVisible);
                this.filterPromos("female", "vestuario");
              }}
            >
              <Text>Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({}, dispatch);
};

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserFilter);
