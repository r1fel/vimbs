import http.server
import socketserver
import os
import asyncio
from img_classifier import Classifier  # Replace 'image_classifier' with your module name
from img_classifier import process_image_url, get_categories
from PIL import Image
#from word_classifier import 

# Define the directory where your test images are located
test_image_directory = os.getcwd() + "/test_imgs"


# Test the image classifier
def test_image_classifier():
    
    classifier = Classifier()
    
    # get all images from test directory
    test_images = os.listdir(test_image_directory)

    # test each image
    for image in test_images:
        image_path = test_image_directory + "/" + image
        # load image
        img = Image.open(image_path)
        img = classifier.validate_image(img)
        # get the image category
        results = classifier.classify_image(img)

        print("Input Image: " + image)
        for idx, result in enumerate(results):
            # print results in numbered order to console
            print(f"Top {idx + 1} prediction : {result[1]}")

if __name__ == "__main__":
    # Run the test script
    test_image_classifier()
