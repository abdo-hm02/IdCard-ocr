import cv2
import numpy as np
import face_recognition
import base64

class FaceComparator:
    def __init__(self, similarity_threshold=0.4):
        self.similarity_threshold = similarity_threshold

    def load_image(self, image_path):
        """Load and convert image to RGB format"""
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image from {image_path}")
        return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    def extract_face_encoding(self, image):
        """Extract face encoding from image"""
        face_locations = face_recognition.face_locations(image)
        
        if not face_locations:
            raise ValueError("No face detected in the image")
        
        face_encodings = face_recognition.face_encodings(image, [face_locations[0]])
        
        if not face_encodings:
            raise ValueError("Could not encode the face in the image")
            
        return face_encodings[0], face_locations[0]

    def compare_faces(self, image1_path, image2_path):
        """
        Compare faces in two images and return similarity results.
        Returns dict with match result, confidence score, and face locations.
        """
        try:
            # Load images
            image1 = self.load_image(image1_path)
            image2 = self.load_image(image2_path)

            # Get face encodings
            encoding1, location1 = self.extract_face_encoding(image1)
            encoding2, location2 = self.extract_face_encoding(image2)

            # Calculate similarity
            distance = face_recognition.face_distance([encoding1], encoding2)[0]
            confidence = float(1 - distance)  # Convert to float
            # Explicitly convert numpy.bool_ to Python bool
            is_match = True if confidence >= self.similarity_threshold else False

            # Convert locations to plain lists
            loc1 = [int(i) for i in location1]
            loc2 = [int(i) for i in location2]

            result = {
                'success': True,
                'match': is_match,  # This is now a Python bool
                'confidence': float(round(confidence * 100, 2)),
                'face_locations': {
                    'image1': loc1,
                    'image2': loc2
                }
            }

            return result

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }