import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useState, useEffect, useContext } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import { UserContext } from "../user-context";
import { supabase } from "../lib/supabase";
import { scale, verticalScale } from 'react-native-size-matters';
import * as ImageManipulator from 'expo-image-manipulator';
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';
import uuid from 'react-native-uuid';
import {decode} from 'base64-arraybuffer';

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

    const addImageByCamera = async () => {
        if (!isEditable) return;
        await ImagePicker.requestCameraPermissionsAsync();
        let _image = await ImagePicker.launchCameraAsync({
            cameraType: ImagePicker.CameraType.front,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true
        });
        let manipImage = await ImageManipulator.manipulateAsync(_image.assets[0].uri, 
            [], {compress: 0.5, format: ImageManipulator.SaveFormat.JPEG});
        console.log("manipImage" ,JSON.stringify(manipImage.uri));

        if (!manipImage.canceled) {
            setImageUri(manipImage.uri);
            const mediaUrl = await uploadToStorage(manipImage.uri);  
            console.log("mediaUrl: ", mediaUrl);
            handleSetPicURI(mediaUrl);
            // setImageUri(_image.assets[0].uri);
            // handleSetPicURI(_image.assets[0].uri);
            // saveImageLocally(_image.assets[0].uri);
        } else{
            console.log("image canceled");
        }
    };

    const addImage = async () => {
        if (!isEditable) return;
        let _image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true
        });
        let manipImage = await ImageManipulator.manipulateAsync(_image.assets[0].uri, 
            [], {compress: 0.5, format: ImageManipulator.SaveFormat.JPEG});
        console.log(JSON.stringify(manipImage.uri));

        if (!manipImage.canceled) {
            setImageUri(manipImage.uri);
            const mediaUrl = await uploadToStorage(manipImage.uri);  
            console.log("mediaUrl: ", mediaUrl);
            handleSetPicURI(mediaUrl);
            // setImageUri(_image.assets[0].uri);
            // handleSetPicURI(_image.assets[0].uri);
            // saveImageLocally(_image.assets[0].uri);
        }
    };

    const uploadToStorage = async (fileUri) => {
        try {
            const { data: {user} } = await supabase.auth.getUser();
            if (!user) {
                alert("User not found");
                return;
            }
            const supabaseUserId = user.id;
            const fileExt = fileUri.split('.').pop();
            const fileName = `${supabaseUserId}/${uuid.v4()}.${fileExt}`;
            const base64File = await FileSystem.readAsStringAsync(fileUri, {encoding: FileSystem.EncodingType.Base64});
            const fileBuffer = decode(base64File);
            
            // Define MIME types
            const mimeTypes = {
                jpg: "image/jpeg",
                jpeg: "image/jpeg",
                png: "image/png",
            };
            const contentType = mimeTypes[fileExt] || "application/octet-stream";
            const { data, error } = await supabase
                .storage
                .from('here-files')
                .upload(fileName, fileBuffer, {
                    contentType: contentType
            });

            if (error) {
                console.error("Upload error: ", error.message);
                alert("Failed to upload media");
                return null;
            }
            // Retrieve public URL
            // const { data: publicUrlData } = supabase.storage.from('here-files').getPublicUrl(fileName);
            // console.log("File uploaded successfully: ", publicUrlData.publicUrl);
            const { data: signedUrlData, error: signedUrlError } = await supabase
                .storage
                .from('here-files')
                .createSignedUrl(fileName, 60 * 60 * 24); // Expiration: 24 hours

            if (signedUrlError) {
                console.error("Public URL error: ", publicUrlError.message);
                alert("Failed to retrieve media URL");
                return null;
            }

            let decodedUrl = decodeURIComponent(signedUrlData.signedUrl);
            console.log("decodedUrl:", decodedUrl);

            return decodedUrl;
        } catch (e) {
            alert(`Failed to upload file: ${e.message}`);
        }
    };

    const handleSetPicURI = async (uri) => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        console.log("uri:", uri);
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/set_picture/${user.username}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
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
                <Image source={{ uri: imageUri }} style={styles.profilePic} cachePolicy="memory-disk"/>
            ) : (
                <Image source={FallbackPhoto}/>
            )}
            {isEditable && (
                <View style={styles.uploadBtnContainer}>
                    <TouchableOpacity onPress={() => setModalVisibility(true)} style={styles.uploadBtn}>
                        {/* <Text>{image ? 'Edit' : 'Upload'} Image</Text> */}
                        <Ionicons 
                            name="camera"
                            size={22}
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
        borderRadius: 50, width: scale(110), height: verticalScale(110), marginBottom: 10
    },
    container: {
        elevation: 2,
        height: verticalScale(110),
        width: scale(110),
        backgroundColor: '#efefef',
        position: 'relative',
        borderRadius: 999,
        overflow: 'hidden'
    },
    uploadBtnContainer: {
        opacity: 0.6,
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: 'gray',
        width: '100%',
        height: '24%'
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