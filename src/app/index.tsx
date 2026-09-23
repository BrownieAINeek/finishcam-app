import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useRef, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Handle permissions
  if (!permission || !mediaPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting permissions...</Text>
      </View>
    );
  }

  if (!permission.granted || !mediaPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          We need camera and gallery access to work.
        </Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={() => {
            requestPermission();
            requestMediaPermission();
          }}
        >
          <Text style={styles.text}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync();
        if (video?.uri) {
          await saveToGallery(video.uri);
        }
      } catch (e) {
        console.error("Recording error:", e);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const saveToGallery = async (uri: string) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      const album = await MediaLibrary.getAlbumAsync("FinishCam");
      if (album == null) {
        await MediaLibrary.createAlbumAsync("FinishCam", asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      Alert.alert("Saved!", "Video saved to FinishCam album.");
    } catch (error) {
      console.error("Gallery save error:", error);
      Alert.alert("Saved to default gallery", "Could not create custom album.");
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        ref={cameraRef}
        mode="video"
        videoQuality="480p"
      >
        {/* Vertical Finish Line */}
        <View style={styles.finishLine} pointerEvents="none" />

        {/* Settings Button (Top Right) */}
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => setSettingsVisible(true)}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>

        {/* Record Button (Bottom Center) */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.recordBtn, isRecording && styles.recordingBtn]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <View style={styles.stopSquare} />
            ) : (
              <View style={styles.recordCircle} />
            )}
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>
            <Text style={styles.modalText}>
              Coming soon in the full version.
            </Text>
            <Text style={styles.modalText}>
              Resolution and FPS will be pre-configured for race conditions.
            </Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSettingsVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1, justifyContent: "space-between" },
  text: { color: "#fff", fontSize: 16, textAlign: "center", margin: 20 },
  permissionBtn: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    alignSelf: "center",
  },

  finishLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 2,
    backgroundColor: "rgba(0, 255, 0, 0.7)",
    zIndex: 10,
  },

  settingsBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 20,
    padding: 10,
  },
  settingsIcon: { fontSize: 28 },

  controls: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
  recordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingBtn: { borderColor: "#ff0000" },
  recordCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ff0000",
  },
  stopSquare: { width: 30, height: 30, backgroundColor: "#ff0000" },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: "#555",
  },
  closeBtn: {
    marginTop: 15,
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
