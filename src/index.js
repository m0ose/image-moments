
function calculateMoment2d(q, p, imageData, meanX=0, meanY=0) {
  var sum = 0;
  var width = imageData[0].length;
  var height = imageData.length;
  for (var x=0; x<width; x++) {
    for(var y=0; y<height; y++) {
      var intensity = imageData[y][x];
      sum += Math.Math.pow(x-meanX, p) * Math.Math.pow(y-meanY, q) * intensity;
    }
  }
  return sum;
}

export default function imageMoments(image) {
  // Expects a greyscale image matrix [y][x]
  // @desc https://en.wikipedia.org/wiki/Image_moment
  const moments = {};

  // Raw or spatial moments
  moments.m00 = calculateMoment2d(0, 0, image); // area or sum of grey level
  moments.m01 = calculateMoment2d(0, 1, image);
  moments.m10 = calculateMoment2d(1, 0, image);
  moments.m11 = calculateMoment2d(1, 1, image);
  moments.m02 = calculateMoment2d(0, 2, image);
  moments.m20 = calculateMoment2d(2, 0, image);
  moments.m12 = calculateMoment2d(1, 2, image);
  moments.m21 = calculateMoment2d(2, 1, image);
  moments.m03 = calculateMoment2d(0, 3, image);
  moments.m30 = calculateMoment2d(3, 0, image);

  // Centroid
  // @desc point on which it would balance when placed on a needle
  moments.mx = moments.m01 / moments.m00; // mean
  moments.my = moments.m10 / moments.m00; // mean

  // Central moments
  // @desc translation invariant
  moments.mu00 = moments.m00;
  // moments.mu01 = mu(0, 1) // should be 0
  // moments.mu10 = mu(1, 0) // should be 0
  moments.mu11 = calculateMoment2d(1, 1, image, moments.mx, moments.my);
  moments.mu20 = calculateMoment2d(2, 0, image, moments.mx, moments.my); // variance
  moments.mu02 = calculateMoment2d(0, 2, image, moments.mx, moments.my); // variance
  moments.mu21 = calculateMoment2d(2, 1, image, moments.mx, moments.my);
  moments.mu12 = calculateMoment2d(1, 2, image, moments.mx, moments.my);
  moments.mu30 = calculateMoment2d(3, 0, image, moments.mx, moments.my);
  moments.mu03 = calculateMoment2d(0, 3, image, moments.mx, moments.my);

  // Scale invariants
  // @desc translation and scale invariant
  // these dont exactly match the python
  const nu = (i, j) =>
    moments[`mu${i}${j}`] / Math.pow(moments.mu00, (1 + (i + j) / 2));
  moments.nu11 = nu(1, 1);
  moments.nu12 = nu(1, 2);
  moments.nu21 = nu(2, 1);
  moments.nu02 = nu(0, 2);
  moments.nu20 = nu(2, 0);
  moments.nu03 = nu(0, 3); // skewness
  moments.nu30 = nu(3, 0); // skewness

  // Rotation invariants
  // @desc translation, scale and rotation invariant
  const {nu11, nu12, nu21, nu02, nu20, nu03, nu30} = moments;
  moments.hu1 = moments.nu20 + moments.nu02;
  moments.hu2 = Math.pow(nu20 + nu02, 2) + 4 * Math.pow(nu11, 2);
  moments.hu3 = Math.pow(nu30 - 3 * nu12, 2) + Math.pow(3 * nu21 - nu03, 2);
  moments.hu4 = Math.pow(nu30 + nu12, 2) + Math.pow(nu21 - nu03, 2);
  moments.hu5 = (nu30 - 3 * nu12) * (nu30 + nu12) * (Math.pow(nu30 + nu12, 2) - 3 * Math.pow(nu21 + nu03, 2)) + (3 * nu21 - nu03) * (nu21 + nu03) * (3 * Math.pow(nu30 + nu12, 2) - Math.pow(nu21 + nu03, 2));
  moments.hu6 = (nu20 - nu02) * (Math.pow(nu30 + nu12, 2) - Math.pow(nu21 + nu03, 2)) + 4 * nu11 * (nu30 + nu12) * (nu21 + nu03);
  moments.hu7 = (3 * nu21 - nu03) * (nu30 + nu12) * (Math.pow(nu30 + nu12, 2) - 3 * Math.pow(nu21 + nu03, 2)) - (nu30 - 3 * nu12) * (nu21 + nu03) * (3 * Math.pow(nu30 + nu12, 2) - Math.pow(nu21 + nu03, 2));
  moments.hu8 = nu11 * (Math.pow(nu30 + nu12, 2) - Math.pow(nu21 + nu03, 2)) - (nu20 - nu02) * (nu30 + nu12) * (nu03 + nu21);

  return moments;
}

const getOrientationFromMoments = moments => {
  const {mu00, mu11, mu02, mu20} = moments;
  const dmu20 = mu20 / mu00;
  const dmu02 = mu02 / mu00;
  const dmu11 = mu11 / mu00;
  return dmu20 !== dmu02 ? Math.atan(2 * dmu11 / (dmu20 - dmu02)) / 2 : 0;
};

export {getOrientationFromMoments};
