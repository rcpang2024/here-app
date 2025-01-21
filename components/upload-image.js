import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useState, useEffect, useContext } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import { UserContext } from "../user-context";
// import { FIREBASE_AUTH } from "../FirebaseConfig";
import { supabase } from "../lib/supabase";
import * as ImageManipulator from 'expo-image-manipulator';
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';

const UploadImage = ({ theURI, isEditable }) => {
    // const [image, setImage] = useState(imageUri || null);
    const [imageUri, setImageUri] = useState(theURI || null);
    const [modalVisibility, setModalVisibility] = useState(false);
    const { user, updateUserContext } = useContext(UserContext);

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

    // NEED TO COMPRESS IMAGE BEFORE UPLOAD
    const addImageByCamera = async () => {
        if (!isEditable) return;
        await ImagePicker.requestCameraPermissionsAsync();
        let _image = await ImagePicker.launchCameraAsync({
            cameraType: ImagePicker.CameraType.front,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        });
        const manipImage = await ImageManipulator.manipulateAsync(_image.assets[0].uri, 
            [], {compress: 0.5, format: ImageManipulator.SaveFormat.JPEG});
        console.log(JSON.stringify(manipImage.uri));
        if (!_image.canceled) {
            setImageUri(manipImage.uri);
            handleSetPicURI(manipImage.uri);
            // setImageUri(_image.assets[0].uri);
            // handleSetPicURI(_image.assets[0].uri);
            // saveImageLocally(_image.assets[0].uri);
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
        const manipImage = await ImageManipulator.manipulateAsync(_image.assets[0].uri, 
            [], {compress: 0.5, format: ImageManipulator.SaveFormat.JPEG});
        console.log(JSON.stringify(manipImage.uri));
        if (!_image.canceled) {
            setImageUri(manipImage.uri);
            handleSetPicURI(manipImage.uri);
            // setImageUri(_image.assets[0].uri);
            // handleSetPicURI(_image.assets[0].uri);
            // saveImageLocally(_image.assets[0].uri);
        }
    };

    const handleSetPicURI = async (uri) => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/set_picture/${user.username}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication': `Bearer ${idToken}`
                },
                body: JSON.stringify({ uri: uri }),
            });
            if (response.ok) {
                const data = await response.json();
                const updatedUser = {
                    ...user,
                    profile_pic: uri,
                };
                await updateUserContext(updatedUser);
                console.log("Profile picture updated successfully:", data);
            }
        } catch (e) {
            console.error("Error setting picture URI: ", e);
        }
    };

    // const saveImageLocally = async (uri) => {
    //     try {
    //       const fileName = uri.split('/').pop();
    //       const localUri = `${FileSystem.documentDirectory}${fileName}`;
    //       await FileSystem.copyAsync({ from: uri, to: localUri });
    //       setImageUri(localUri);
    //     } catch (error) {
    //       console.error('Error saving image locally:', error);
    //     }
    // };

    return (
        <View style={styles.container}>
            {imageUri ? (
                <Image source={{ uri: imageUri }} style={{width: 180, height: 180}} cachePolicy="memory-disk"/>
            ) : (
                <Image source={FallbackPhoto}/>
            )}
            {isEditable && (
                <View style={styles.uploadBtnContainer}>
                    <TouchableOpacity onPress={() => setModalVisibility(true)} style={styles.uploadBtn}>
                        {/* <Text>{image ? 'Edit' : 'Upload'} Image</Text> */}
                        <Ionicons 
                            name="camera"
                            size={25}
                            color="black"
                        />
                    </TouchableOpacity>
                </View>
            )}
            {modalVisibility && (
                <Modal 
                    animationType="slide"
                    transparent={true}
                    visible={modalVisibility}
                    onRequestClose={() => setModalVisibility(false)}
                >
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <View style={styles.modalStyling}>
                            <TouchableOpacity onPress={addImageByCamera}>
                                <Text style={{fontSize: 18}}>CAMERA</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={addImage}>
                                <Text style={{fontSize: 18}}>GALLERY</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisibility(false)}>
                                <Text style={{fontSize: 18, color: 'red'}}>CLOSE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    profilePic: {
        borderRadius: 50, width: 100, height: 100, marginBottom: 10
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
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    modalStyling: {
        backgroundColor: 'white', 
        padding: 30, 
        borderRadius: 10, 
        alignItems: 'center', 
        flexDirection: 'row',
        gap: 20
    }
});

export default UploadImage;