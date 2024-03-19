
import tensorflow as tf
import numpy as np
import os
import matplotlib.pyplot as plt
import matplotlib.image as mpimg


# Load the ResNet50V2 model
model = tf.keras.applications.ResNet50V2(weights='imagenet')


# Load the images
folder = "C:/Users/cewei/OneDrive/Desktop/CARFINDER/Cars/ALFA/ALFA ROMEO Tonale (2022-2023)/"


#loop through the folders
for folderPath in os.listdir(folder):
    folderPath = folder + folderPath
    for file in os.listdir(folderPath):

        
        keep = False

        # Load the images
        image_path = folderPath + "/" + file
        try:
            img = tf.keras.utils.load_img(image_path, target_size=(224, 224))
            img_array = tf.keras.utils.img_to_array(img)
            img_array = tf.expand_dims(img_array, 0)  # Create a batch
        
            # Preprocess the image for the ResNet50V2 model
            img_array = tf.keras.applications.resnet_v2.preprocess_input(img_array)

            # Make a prediction
            #if a car label is one of the top 5, keep the image
            #if not, delete the image
            predictions = model.predict(img_array)

            decoded_predictions = tf.keras.applications.resnet_v2.decode_predictions(predictions, top=5)  # Get the top prediction
            for i, prediction in enumerate(decoded_predictions[0]):
                class_label = prediction[1]
                probability = prediction[2]
                if not keep:
                    if class_label in ['minivan', 'limousine', 'sports_car', 'convertible', 'cab', 'racer', 'passenger_car',
                    'recreational_vehicle', 'pickup', 'police_van', 'minibus', 'moving_van', 'tow_truck', 'jeep',
                    'landrover', 'beach_wagon']:
                        keep = True

            if not keep:
                os.remove(image_path)
            # Function to capture keyboard input
        # Load an image using Matplotlib

        except Exception as e:
            print("SOMETHING WENT WRONG WITH THIS FILE", image_path)
            print(e)
            #os.remove(image_path)