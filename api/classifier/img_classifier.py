import tensorflow as tf
from tensorflow.keras.applications.inception_resnet_v2 import InceptionResNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
import numpy as np
import requests
from PIL import Image
from io import BytesIO

class Classifier:
    def __init__(self):
        # Limit GPU memory usage
        gpus = tf.config.experimental.list_physical_devices('GPU')
        if gpus:
            try:
                for gpu in gpus:
                    tf.config.experimental.set_memory_growth(gpu, True)
            except RuntimeError as e:
                print(e)

        # Load the InceptionResNetV2 model pretrained on ImageNet-21K
        self.model = InceptionResNetV2(weights='imagenet')
        self.input_size = (299, 299) 

    def validate_image(self, img):
        # Resize image
        if img is not None:
            img = img.resize(self.input_size)
            return img
        else:
            return None
        
    def classify_image(self, img):
        if img is not None:
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)
            predictions = self.model.predict(img_array)
            decoded_predictions = decode_predictions(predictions, top=5)[0]
            return decoded_predictions
        return None
    
# TODO: Adapt to specific data object
def get_categories(self, word):
    # Check if word is already listed in a certain category
    for category in self.categories:
        if word in category:
            return category

async def process_image_url(image_url, classifier):
    try:
        img = await fetch_image_from_url(image_url)
        if img:
            validated_image = classifier.validate_image(img)
            if validated_image:
                predictions = classifier.classify_image(validated_image)
                if predictions:
                    return predictions
    except Exception as e:
        print(f"Error processing {image_url}: {str(e)}")
    return None

async def fetch_image_from_url(image_url):
    response = requests.get(image_url)
    if response.status_code == 200:
        img = Image.open(BytesIO(response.content))
        return img
    return None
