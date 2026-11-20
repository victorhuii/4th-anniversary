"""Development-only reference extraction. Requires opencv-python and numpy.
The user-supplied MP4 is deliberately not included in this repository.
"""
import sys
from pathlib import Path
import cv2
import numpy as np

video = cv2.VideoCapture(sys.argv[1])
out = Path(sys.argv[2] if len(sys.argv)>2 else '/private/tmp/pastel-isolated')
out.mkdir(parents=True, exist_ok=True)
# Artwork interior at 8.5s, excluding the title bar and black window margins.
corners = np.float32([[159,330],[609,348],[568,1000],[123,950]])
target = np.float32([[0,0],[629,0],[629,899],[0,899]])
transform = cv2.getPerspectiveTransform(corners,target)
for t in [0,.5,1,2,3,4,5,6,7,8,8.5,9,9.5,10,10.5,11]:
    video.set(cv2.CAP_PROP_POS_MSEC,t*1000)
    ok, frame=video.read()
    if ok:
        isolated=cv2.warpPerspective(frame,transform,(630,900))
        cv2.imwrite(str(out/f'{t:g}.png'),isolated)
print(f'{video.get(cv2.CAP_PROP_FRAME_COUNT)/video.get(cv2.CAP_PROP_FPS):.3f}s; extracted to {out}')
