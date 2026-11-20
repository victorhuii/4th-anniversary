"""Compare a procedural browser capture with the isolated source (OpenCV + NumPy)."""
import json
from pathlib import Path
import cv2
import numpy as np
root=Path(__file__).resolve().parents[1]
a=cv2.imread(str(root/'public/assets/source/bouquet.png')).astype(np.float32)
b=cv2.imread(str(root/'verification/painting-8566.png'))
b=cv2.resize(b,(a.shape[1],a.shape[0]),interpolation=cv2.INTER_AREA).astype(np.float32)
def ssim(a,b):
    ux=cv2.GaussianBlur(a,(11,11),1.5);uy=cv2.GaussianBlur(b,(11,11),1.5)
    vx=cv2.GaussianBlur(a*a,(11,11),1.5)-ux*ux
    vy=cv2.GaussianBlur(b*b,(11,11),1.5)-uy*uy
    cov=cv2.GaussianBlur(a*b,(11,11),1.5)-ux*uy
    return float(np.mean(((2*ux*uy+6.5025)*(2*cov+58.5225))/((ux*ux+uy*uy+6.5025)*(vx+vy+58.5225))))
result={'comparison':'isolated MP4-derived artwork versus procedural final screenshot, 630x900','ssim':ssim(a,b),'mae_255':float(np.mean(np.abs(a-b))),'rmse_255':float(np.sqrt(np.mean((a-b)**2)))}
(root/'verification/comparison.json').write_text(json.dumps(result,indent=2))
cv2.imwrite(str(root/'verification/comparison.png'),np.concatenate([a,b],axis=1))
print(json.dumps(result))
