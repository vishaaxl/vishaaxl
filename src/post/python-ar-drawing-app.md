---
title: "Beginner Python Project: Build an Augmented Reality Drawing App" 
subtitle: Create a Gesture-Controlled Drawing Experience with Webcam and Hand Tracking Using OpenCV and Mediapipe
author: Vishal Shukla
date: December 31, 2024
---
# **Beginner Python Project: Build an Augmented Reality Drawing App Using OpenCV and Mediapipe**

In this Python project, we'll create a simple AR drawing app. Using your webcam and hand gestures, you can draw virtually on the screen, customize your brush, and even save your creations! 

## Setup

To get started, create a new folder and initialize a new virtual environment using:

```sh
python -m venv venv
```
```sh
./venv/Scripts/activate
```

Next up install the required libraries using pip or installer of your choice:
```sh
pip install mediapipe
```
```sh
pip install opencv-python
```

##  **Note**
You may have trouble installing mediapipe with latest version on python. As I am writing this blog I am using python 3.11.2. Make sure to use the compatible version on python.

## Step 1: Capture Webcam Feed

The first step is to set up your webcam and display the video feed. We'll use OpenCV's `VideoCapture` to access the camera and continuously display frames.


```python
import cv2  

# The argument '0' specifies the default camera (usually the built-in webcam).
cap = cv2.VideoCapture(0)

# Start an infinite loop to continuously capture video frames from the webcam
while True:
    # Read a single frame from the webcam
    # `ret` is a boolean indicating success; `frame` is the captured frame.
    ret, frame = cap.read()
    
    # Check if the frame was successfully captured
    # If not, break the loop and stop the video capture process.
    if not ret:
        break

    # Flip the frame horizontally (like a mirror image)
    frame = cv2.flip(frame, 1)

    # Display the current frame in a window named 'Webcam Feed'
    cv2.imshow('Webcam Feed', frame)

    # Wait for a key press for 1 millisecond
    # If the 'q' key is pressed, break the loop to stop the video feed.
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the webcam resource to make it available for other programs
cap.release()

# Close all OpenCV-created windows
cv2.destroyAllWindows()

```

**Did You Know?**  

When using `cv2.waitKey()` in OpenCV, the returned key code may include extra bits depending on the platform. To ensure you correctly detect key presses, you can mask the result with `0xFF` to isolate the lower 8 bits (the actual ASCII value). Without this, your key comparisons might fail on some systems—so always use `& 0xFF` for consistent behavior!

## Step 2: Integrate Hand Detection

Using Mediapipe's Hands solution, we'll detect the hand and extract the position of key landmarks like the index and middle fingers.

```python
import cv2  
import mediapipe as mp

# Initialize the MediaPipe Hands module
mp_hands = mp.solutions.hands  # Load the hand-tracking solution from MediaPipe
hands = mp_hands.Hands(
    min_detection_confidence=0.9,
    min_tracking_confidence=0.9 
)

cap = cv2.VideoCapture(0)
while True:
    ret, frame = cap.read()
    if not ret:
        break 

    # Flip the frame horizontally to create a mirror effect
    frame = cv2.flip(frame, 1)

    # Convert the frame from BGR (OpenCV default) to RGB (MediaPipe requirement)
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Process the RGB frame to detect and track hands
    result = hands.process(frame_rgb)

    # If hands are detected in the frame
    if result.multi_hand_landmarks:
        # Iterate through all detected hands
        for hand_landmarks in result.multi_hand_landmarks:
            # Get the frame dimensions (height and width)
            h, w, _ = frame.shape

            # Calculate the pixel coordinates of the tip of the index finger
            cx, cy = int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].x * w), \
                     int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].y * h)
            
            # Calculate the pixel coordinates of the tip of the middle finger
            mx, my = int(hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP].x * w), \
                     int(hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP].y * h)

            # Draw a circle at the index finger tip on the original frame
            cv2.circle(frame, (cx, cy), 10, (0, 255, 0), -1)  # Green circle with radius 10

    # Display the processed frame in a window named 'Webcam Feed'
    cv2.imshow('Webcam Feed', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break  # Exit the loop if 'q' is pressed

# Release the webcam resources for other programs
cap.release()
cv2.destroyAllWindows()

```

## Step 3: Track Finger Position and Draw

We’ll track the index finger and allow drawing only when the index and middle fingers are separated by a threshold distance.

 We'll maintain a list of co-ordinates of the index fingers to draw on the original frame and every time middle finger is close enough, we'll append `None` to this co-ordinates array indicating a breakage.

```python
import cv2  
import mediapipe as mp  
import math  

# Initialize the MediaPipe Hands module
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    min_detection_confidence=0.9,  
    min_tracking_confidence=0.9   
)

# Variables to store drawing points and reset state
draw_points = []  # A list to store points where lines should be drawn
reset_drawing = False  # Flag to indicate when the drawing should reset

# Brush settings
brush_color = (0, 0, 255)  
brush_size = 5 


cap = cv2.VideoCapture(0)
while True:
    ret, frame = cap.read()  
    if not ret:
        break 

    frame = cv2.flip(frame, 1) 
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) 
    result = hands.process(frame_rgb)  

    # If hands are detected
    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            h, w, _ = frame.shape  # Get the frame dimensions (height and width)

            # Get the coordinates of the index finger tip
            cx, cy = int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].x * w), \
                     int(hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].y * h)

            # Get the coordinates of the middle finger tip
            mx, my = int(hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP].x * w), \
                     int(hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP].y * h)

            # Calculate the distance between the index and middle finger tips
            distance = math.sqrt((mx - cx) ** 2 + (my - cy) ** 2)

            # Threshold distance to determine if the fingers are close (used to reset drawing)
            threshold = 40 

            # If the fingers are far apart
            if distance > threshold:
                if reset_drawing:  # Check if the drawing was previously reset
                    draw_points.append(None)  # None means no line
                    reset_drawing = False  
                draw_points.append((cx, cy))  # Add the current point to the list for drawing
            else:  # If the fingers are close together set the flag to reset drawing
                reset_drawing = True  # 

    # Draw the lines between points in the `draw_points` list
    for i in range(1, len(draw_points)):
        if draw_points[i - 1] and draw_points[i]:  # Only draw if both points are valid
            cv2.line(frame, draw_points[i - 1], draw_points[i], brush_color, brush_size)


    cv2.imshow('Webcam Feed', frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the webcam and close all OpenCV windows
cap.release()
cv2.destroyAllWindows()

```

## Step 4: Improvements

-   Use OpenCV `rectangle()` and `putText()` for buttons to toggle brush size and color.
- Add an option to save the frame.
- Add an eraser tool, use the new co-ordinates to modify `draw_points` array.