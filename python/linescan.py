import cv2
import numpy as np
import os
import sys

# ============ CONFIG ============
SLICE_WIDTH = 3                  # Pixels to grab from center (3 = smoother, 1 = sharper)
# ================================

# Get video path from command line
if len(sys.argv) < 2:
    print("Usage: python linescan.py <video_file>")
    print("Example: python linescan.py test.mp4")
    sys.exit(1)

VIDEO_PATH = sys.argv[1]

if not os.path.exists(VIDEO_PATH):
    print(f"ERROR: File not found: {VIDEO_PATH}")
    sys.exit(1)

# Derive output name from video name
base_name = os.path.splitext(os.path.basename(VIDEO_PATH))[0]
OUTPUT_PATH = f"{base_name}_linescan.jpg"

def main():
    # Load video
    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        print(f"ERROR: Could not open {VIDEO_PATH}")
        return

    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    print(f"Video: {width}x{height} @ {fps}fps, {frame_count} frames")
    print(f"Output will be saved as: {OUTPUT_PATH}")

    # Position of the slice: center of the frame
    center_x = width // 2
    slice_start = center_x - (SLICE_WIDTH // 2)

    # Output image: height of frames, width = num_frames * slice_width
    output = np.zeros((height, frame_count * SLICE_WIDTH, 3), dtype=np.uint8)

    print("Processing frames...")

    frame_index = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Grab the vertical slice
        slice_img = frame[:, slice_start:slice_start + SLICE_WIDTH]

        # Place it in the output
        x_offset = frame_index * SLICE_WIDTH
        output[:, x_offset:x_offset + SLICE_WIDTH] = slice_img

        frame_index += 1
        if frame_index % 30 == 0:
            print(f"  Processed {frame_index}/{frame_count} frames")

    cap.release()

    # Trim the output in case frame_count was overestimated
    output = output[:, :frame_index * SLICE_WIDTH]

    # Save
    cv2.imwrite(OUTPUT_PATH, output)
    print(f"\nDone. Saved as {OUTPUT_PATH}")
    print(f"Output size: {output.shape[1]}x{output.shape[0]}")

if __name__ == "__main__":
    main()