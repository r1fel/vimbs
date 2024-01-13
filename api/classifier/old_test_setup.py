import http.server
import socketserver
import os
import asyncio
from img_classifier import Classifier  # Replace 'image_classifier' with your module name
from img_classifier import process_image_url, get_categories
#from word_classifier import 

# Define the directory where your test images are located
test_image_directory = os.getcwd() + "/test_imgs"

# Generate URLs for test images
def generate_image_urls(image_directory, port=8000):
    image_urls = []
    for filename in os.listdir(image_directory):
        if filename.endswith(".jpeg"):
            url = f"http://localhost:{port}/{filename}"
            image_urls.append(url)
    return image_urls

# Test the image classifier
async def test_image_classifier():
    classifier = Classifier()
    image_urls = generate_image_urls(test_image_directory)

    results = []
    tasks = []

    for image_url in image_urls:
        tasks.append(process_image_url(image_url, classifier))

    results = await asyncio.gather(*tasks)

    lables = []
    categories = []

    
    for i, result in enumerate(results):
        if result:
            for j, (imagenet_id, label, score) in enumerate(result):
                if j == 0 or j == 1:
                    lables.append(label)
                    #categories.append(get_categories(label))
                    print(image_urls[i] + ": " + label + " (" + str(score) + ")")

    return lables, categories
                 

if __name__ == "__main__":
    # Run the test script
    #asyncio.run(test_image_classifier())

    # load image

    tc = Classifier()
