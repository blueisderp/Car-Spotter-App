"""
Cameron produced code to simply run the model on his local machine to get a prediction

Brian adapted it to work with Flask

Then Brian re-fitted it to work by itself stand-alone so flask can simply call predict(..)
"""
from ultralytics import YOLO
from io import BytesIO
from PIL import Image

# Load the model
model = YOLO("best.pt")

def predict_image(image_bytes):
    """
    Returns results

    This endpoint used to take a POST request with the body being bytes of a jpg
    It just returns json with the results
    """
    return model.predict(Image.open(BytesIO(image_bytes)))[0]
