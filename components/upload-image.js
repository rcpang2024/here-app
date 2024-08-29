import { View, Image, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useState, useEffect } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

const UploadImage = ({ imageUri, isEditable}) => {
    const [image, setImage] = useState(imageUri || null);
    const [modalVisibility, setModalVisibility] = useState(false);

    const cameraRollPermission = async () => {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Please grant permissions in your device's settings.");
        } else {
            console.log('Camera roll permissions granted.');
        }
    };

    // useEffect(() => {
    //     cameraRollPermission();
    // }, []);

    const addImageByCamera = async () => {
        if (!isEditable) return;
        await ImagePicker.requestCameraPermissionsAsync();
        let _image = await ImagePicker.launchCameraAsync({
            cameraType: ImagePicker.CameraType.front,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        });
        console.log(JSON.stringify(_image.assets[0].uri));
        if (!_image.canceled) {
            setImage(_image.assets[0].uri);
        }
    };

    const addImage = async () => {
        if (!isEditable) return;
        let _image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });
        console.log(JSON.stringify(_image.assets[0].uri));
        if (!_image.canceled) {
            setImage(_image.assets[0].uri);
        }
    };

    // const imagePickerModal = () => {

    // };

    return (
        <View style={styles.container}>
            <Image source={{ uri: image }} style={{width: 180, height: 180}}/>
            {isEditable && (
                <View style={styles.uploadBtnContainer}>
                    <TouchableOpacity onPress={addImage} style={styles.uploadBtn}>
                        {/* <Text>{image ? 'Edit' : 'Upload'} Image</Text> */}
                        <Ionicons 
                            name="camera"
                            size={25}
                            color="black"
                        />
                    </TouchableOpacity>
                </View>
            )}
            <Modal 
                animationType="slide"
                transparent={true}
                visible={modalVisibility}
                onRequestClose={() => setModalVisibility(false)}
            >
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity onPress={() => console.log("Camera")}>
                        <Text>Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => console.log("Gallery")}>
                        <Text>Gallery</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    profilePic: {
        borderRadius: 50,
        width: 100,
        height: 100,
        marginBottom: 10,
    },
    container: {
        elevation: 2,
        height: 180,
        width: 180,
        backgroundColor: '#efefef',
        position: 'relative',
        borderRadius: 999,
        overflow: 'hidden'
    },
    uploadBtnContainer: {
        opacity: 0.8,
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: 'gray',
        width: '100%',
        height: '16%'
    },
    uploadBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default UploadImage;