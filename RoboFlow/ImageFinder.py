import time
from selenium import webdriver
from bs4 import BeautifulSoup
import os
import requests
import base64
import binascii
import threading

# run script to run automated web scraper to pull images of specific car type from internet via a browser window

def bingify(car):
    car.replace(" ", "%20")
    return car

def duckify(car):
    car.replace(" ", "+")
    return car


# reads each line from a txt file, each line in txt file is a car make/model that is to be searched on the internet
for car in open("C:/Users/LeNDu/OneDrive/Documents/CS/CECS 491A Senior Project/RoboFlow/cars.txt").readlines():
    
    car = car.strip()
    
    bingCar = bingify(car)
    googleCar = bingify(car)
    duckCar = duckify(car)


    urls = ["https://www.bing.com/images/search?tbm=isch&q="+bingCar,
        "https://www.google.com/search?tbm=isch&q="+googleCar,
        "https://duckduckgo.com/?q="+duckCar+"&iax=images&ia=images"]

    # Create a Selenium WebDriver instance
    driver = webdriver.Edge()  # You need to have ChromeDriver installed
    
    with open("links.txt", "w+") as file:
        
        for url in urls:
        # Navigate to the URL
            driver.get(url)
            
            # Scroll down the page to trigger lazy loading
            scroll_pause_time = 2  # Adjust this value as needed
            scroll_height = driver.execute_script("return document.body.scrollHeight")

            while True:
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(scroll_pause_time)
                new_scroll_height = driver.execute_script("return document.body.scrollHeight")
                if new_scroll_height == scroll_height:
                    break
                scroll_height = new_scroll_height

            # Parse the updated HTML content of the page
            soup = BeautifulSoup(driver.page_source, 'html.parser')

            # Find all "img" tags in the updated HTML
            img_tags = soup.find_all('img')

            # Extract and print the "src" attribute from each "img" tag
            for img_tag in img_tags:
                src = img_tag.get('src')
                if src:
                    if "external-content" in src:
                        src = src[2:]
                    file.write(src + "\n")

            print(len(img_tags))

    driver.quit()

    os.system("sort /unique links.txt")

    

    def download_with_timeout(image_link, save_directory):
        # Create a thread to run the download_image function
        download_thread = threading.Thread(target=download_image, args=(image_link, save_directory))

        # Start the thread
        download_thread.start()

        # Wait for the thread to finish or until the timeout
        download_thread.join(timeout=5)  # Wait for a maximum of 5 seconds

        # Check if the thread is still alive (i.e., if it didn't finish within 5 seconds)
        if download_thread.is_alive():
            # If the thread is still running after 5 seconds, stop it
            download_thread.join()  # This might not work in all cases, depending on what the download_image function is doing

    # Function to download an image from a URL
    def download_image(image_url, save_dir):
        try:
            if "https://" not in image_url:

                response = requests.get("https://"+image_url)
            else:
                response = requests.get(image_url)
            if response.status_code == 200:
                # Extract the filename from the URL
                filename = save_dir+"/"+str(len(os.listdir(save_dir)))+".jpg"
                with open(filename, 'wb') as img_file:
                    img_file.write(response.content)
                print(f"Downloaded: {filename}")
            else:
                print(f"Failed to retrieve image from URL: {image_url}")
        except Exception as e:
            print(f"An error occurred: {str(e)}")

    # Directory where you want to save the downloaded images
    save_directory = 'C:/Users/LeNDu/OneDrive/Documents/CS/CECS 491A Senior Project/RoboFlow/Cars/'+car

    # Create the save directory if it doesn't exist
    os.makedirs(save_directory, exist_ok=True)

    # Read the list of image links from "cleaned.txt"
    cleaned_file_path = 'links.txt'
    try:
        with open(cleaned_file_path, 'r') as file:
            image_links = file.readlines()
    except FileNotFoundError:
        print(f"File not found: {cleaned_file_path}")
        exit()

    # Iterate through the image links and download each image
    for image_link in image_links:
        image_link = image_link.strip()
        
        if image_link:

            if "data:image/" in image_link:
                if "data:image/png" in image_link or "data:image/jpg" in image_link:

                    try:
                        image = base64.b64decode(image_link[22:], validate=True)
                        file_to_save = save_directory+"/"+str(int(time.time() * 1000))+'.jpg'
                        with open(file_to_save, "wb") as f:
                            f.write(image)
                    except binascii.Error as e:
                        print(e, image_link[22:40])


                elif "data:image/jpeg" in image_link:
                    try:
                        image = base64.b64decode(image_link[23:], validate=True)
                        file_to_save = save_directory+"/"+str(int(time.time() * 1000))+'.jpg'
                        with open(file_to_save, "wb") as f:
                            f.write(image)
                    except binascii.Error as e:
                        print(e, image_link[23:40])

                else:
                    print("I am a ", image_link[0:23])

            else:
                download_with_timeout(image_link, save_directory)

    print("Finished downloading images.")
