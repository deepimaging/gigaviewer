import string
import random
import os
from natsort import natsorted
import json
from operator import attrgetter
import shutil

nb_char_tag = 4
start_dir = "auto"
max_depth = 3

config_file_name="config.json"

kind=[None, 'team', 'project', 'capture']

# Create a string containing all lowercase letters and digits.
# To use this option the RenderFromTag (App.js) function needs to be
# updated for lower case. 
# characters = string.ascii_lowercase + string.digits

# Using a hex array.
characters = "0123456789ABCDEF"

# Convert the string to an array of characters.
# character_array = list(characters)

nb_char = len(characters)
# print("Number of unique tags possible", nb_char**nb_char_tag)

def generate_random_string(length=nb_char_tag):
  result = ''.join(random.choice(characters) for i in range(length))
  return result

# random_string = generate_random_string()
# print(random_string)

def get_meta():
  try:
    with open(config_file_name) as file:
      data = json.load(file)

    return data
  except:
    return {}

tags=[]

def loadOrder(obj):
  try:
    with open( 'order.json') as file:
      data = json.load(file)['order']

    obj["sources"] = [ {"tileSources" : data} ]
    return True
  except:
    return False

def addThumbnailImage(obj):
  path = os.path.splitext(obj["sources"][0]["tileSources"][0])[0] + "_files"
  os.chdir(path)

  dir = natsorted(os.scandir(),key=attrgetter("name"))

  thumbnailImg = None

  for item in dir:
    if item.is_dir():
      res = os.listdir(item.name)

      if len(res) == 1:
        thumbnailImg = path + "/" + item.name + "/" + res[0]
      elif len(res) > 1:
        break
  
  if thumbnailImg == None:
    raise Exception('Problem finding thumbnail')
  
  os.chdir("../")

  obj["thumbnailImg"] = thumbnailImg

def list_dir(path=start_dir, depth=0):
  if depth > max_depth:
    return
  # if path.find("stitched") != -1 or path.startswith("height_map") or path.isnumeric():
  #   return {}
  
  print('  ' * depth + "", path)
  os.chdir(path)

  obj={}
  #dir = os.scandir()
  dir = natsorted(os.scandir(),key=attrgetter("name"))

  groups = {}
  files = []
  
  for item in dir:
    if item.is_dir():
      res = list_dir(item.name, depth+1)
      if res:
        groups[item.name] = res
    elif item.name != config_file_name:
      files.append(item.name)
  
  if groups:
    obj["groups"] = groups
  if "order.json" in files:
    loadOrder(obj)
    addThumbnailImage(obj)
  if "metadata.json" in files:
    print("Metadata found but not supported!!")
  # if path + "-thumbnail.jpg" in files:
  #   obj["thumbnailImg"] = path + "-thumbnail.jpg"
  # if not (path + "-thumbnail.jpg") in files:
  #   images = [name+"/"+obj["groups"][name]['thumbnailImg'] for name in obj["groups"]]
  #   print( images )
  
  meta = get_meta()
  
  if depth > 0 and "tag" in meta:
    obj["tag"] = meta["tag"]
    tags.append(meta["tag"])

  # if depth > 0 and not "thumbnailImg" in obj and obj['groups']:
  #   tmp = list(obj["groups"].items())[-1]
  #   if "thumbnailImg" in tmp[1]:
  #     obj["thumbnailImg"] = tmp[0] + "/" + tmp[1]["thumbnailImg"]
  
  if kind[depth]:
    obj["kind"] = kind[depth]

  os.chdir("../")
  return obj

def list_dir_add_tag(obj, path=start_dir, depth=0):
  if not obj:
    return
  
  os.chdir(path)

  if "groups" in obj:
    for item in obj["groups"]:
      list_dir_add_tag(obj["groups"][item], item, depth+1)
  
  if depth > 0 and not "tag" in obj:
    obj["tag"] = createUniqueTag()
    meta = {"tag" : obj["tag"]}
    with open(config_file_name, "w") as file:
      file.write( json.dumps(meta) )
  
  os.chdir("../")


def createUniqueTag():
  # tag = generate_random_string()
  # while tag in tags:
  global nb_char_tag

  for i in range(20):
    tag = generate_random_string(nb_char_tag)
    if tag not in tags:
      tags.append(tag)
      return tag
  
  nb_char_tag = nb_char_tag + 1
  print("Increase tag length to", nb_char_tag)
  return createUniqueTag()

orig_path = os.getcwd()

obj = list_dir()
os.chdir(orig_path)
list_dir_add_tag(obj)
os.chdir(orig_path)

print("Number of tags in use", len(tags), "of", nb_char**nb_char_tag, "(%i^%i)"%(nb_char,nb_char_tag))

with open("imageMetadata.json", "w") as file:
  file.write( json.dumps(obj) )

shutil.copy2('imageMetadata.json', '/var/www/html/imageMetadata.json')