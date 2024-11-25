from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename
import logging
from datetime import datetime
import cv2
from paddleocr import PaddleOCR
from face_comparator import FaceComparator
import numpy as np
from flask_cors import CORS


# Initialize Flask app
app = Flask(__name__)
CORS(app) 

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
app.config['UPLOAD_FOLDER'] = 'temp_uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize face comparator and OCR
face_comparator = FaceComparator(similarity_threshold=0.4)
ocr = PaddleOCR(use_angle_cls=True, lang='en')

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file):
    """Save uploaded file and return the path"""
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return filepath
    return None

def cleanup_files(files):
    """Clean up temporary files"""
    for file in files:
        try:
            if file and os.path.exists(file):
                os.remove(file)
        except Exception as e:
            logger.error(f"Error cleaning up file {file}: {str(e)}")

def extract_text_from_image(image_path):
    """Extract text from image using PaddleOCR and return simple ordered list"""
    try:
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Could not read image")

        result = ocr.ocr(image)
        
        if not result or not result[0]:
            return []

        # Create simple list with just text and order
        text_list = []
        for idx, line in enumerate(result[0], 1):
            text = line[1][0]  # Get just the text
            # Get y-coordinate of the text box for vertical ordering
            y_coord = line[0][0][1]  # Get y-coordinate of first point
            text_list.append({
                "order": idx,
                "text": text,
                "y_coord": y_coord  # We'll use this for sorting
            })

        # Sort by vertical position (top to bottom)
        text_list.sort(key=lambda x: x["y_coord"])
        
        # Remove y_coord and reassign order numbers after sorting
        final_list = []
        for idx, item in enumerate(text_list, 1):
            final_list.append({
                "order": idx,
                "text": item["text"]
            })

        return final_list

    except Exception as e:
        logger.error(f"Error in OCR processing: {str(e)}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy lol',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/compare-faces', methods=['POST'])
def compare_faces():
    """Compare faces in two uploaded images"""
    saved_files = []
    
    try:
        if 'image1' not in request.files or 'image2' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Both image1 and image2 must be provided'
            }), 400

        image1 = request.files['image1']
        image2 = request.files['image2']

        image1_path = save_uploaded_file(image1)
        image2_path = save_uploaded_file(image2)
        saved_files = [image1_path, image2_path]

        if not image1_path or not image2_path:
            return jsonify({
                'success': False,
                'error': 'Invalid file format. Allowed formats: png, jpg, jpeg'
            }), 400

        face_comparator = FaceComparator(similarity_threshold=0.4)
        result = face_comparator.compare_faces(image1_path, image2_path)
        
        # Force convert any potential numpy bool_ to Python bool
        if 'match' in result:
            result['match'] = True if result['match'] else False
        
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Error processing request: {str(e)}'
        }), 500

    finally:
        cleanup_files(saved_files)


@app.route('/api/extract-text', methods=['POST'])
def extract_text():
    """Extract text from uploaded image using PaddleOCR"""
    saved_files = []
    
    try:
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided'
            }), 400

        image = request.files['image']
        image_path = save_uploaded_file(image)
        saved_files = [image_path]

        if not image_path:
            return jsonify({
                'success': False,
                'error': 'Invalid file format. Allowed formats: png, jpg, jpeg'
            }), 400

        text_list = extract_text_from_image(image_path)
        
        return jsonify({
            'success': True,
            'text_count': len(text_list),
            'extracted_text': text_list
        })

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error processing request: {str(e)}'
        }), 500

    finally:
        cleanup_files(saved_files)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)