# export PYTHONPATH=/usr/local/lib/python2.7/site-packages:$PYTHONPATH

import cv2
import json

im = cv2.imread("../fudge.png", cv2.CV_LOAD_IMAGE_GRAYSCALE)

#print json.dumps(im.tolist())
moments = cv2.moments(im)

js = json.dumps(moments)
f = open('../outputs/moments.json', 'w')
f.write(js)
f.close()

sample = json.dumps(im.astype('uint8').tolist())
f2 = open('../fudge.json', 'w')
f2.write(sample)
f2.close()

#print cv2.HuMoments(cv2.moments(im))
