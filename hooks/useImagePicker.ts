import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const useImagePicker = () => {
  const requestPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin Diperlukan",
        "Aplikasi membutuhkan akses ke galeri foto kamu."
      );
      return false;
    }
    return true;
  };

  const pickFromGallery = async (): Promise<string | null> => {
    const granted = await requestPermission();
    if (!granted) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  };

  const pickFromCamera = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Izin Diperlukan",
        "Aplikasi membutuhkan akses ke kamera kamu."
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  };

  const showPickerOptions = (onSelect: (uri: string) => void) => {
    Alert.alert("Pilih Foto", "Ambil foto dari mana?", [
      {
        text: "Kamera",
        onPress: async () => {
          const uri = await pickFromCamera();
          if (uri) onSelect(uri);
        },
      },
      {
        text: "Galeri",
        onPress: async () => {
          const uri = await pickFromGallery();
          if (uri) onSelect(uri);
        },
      },
      { text: "Batal", style: "cancel" },
    ]);
  };

  return { pickFromGallery, pickFromCamera, showPickerOptions };
};
