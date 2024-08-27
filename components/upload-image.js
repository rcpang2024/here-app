import { View, Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

const UploadImage = ({ imageUri, isEditable}) => {
    const [image, setImage] = useState(imageUri || null);

    const cameraRollPermission = async () => {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Please grant permissions in your device's settings.")
        } else {
            console.log('Camera roll permissions granted.')
        }
    };

    // useEffect(() => {
    //     cameraRollPermission();
    // }, []);

    const addImage = async () => {
        if (!isEditable) return;
        let _image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });
        console.log(JSON.stringify(_image.assets[0].uri))
        if (!_image.canceled) {
            setImage(_image.assets[0].uri);
        }
    };

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