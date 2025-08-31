const Hospital = require('../models/Hospital');

const findNearestHospital = async (lat, lng, maxDistanceKm = 10) => {
  const meters = (maxDistanceKm || 10) * 1000;
  const hospitals = await Hospital.find({
    isActive: true,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: meters,
      }
    }
  }).limit(1);

  return hospitals && hospitals.length ? hospitals[0] : null;
};

module.exports = { findNearestHospital };
