require('dotenv').config();
const shiprocket = require('./shiprocket');

async function test() {
  try {
    console.log('🔍 Fetching pickup locations from Shiprocket...\n');
    const locations = await shiprocket.getPickupLocations();
    
    if (locations) {
      console.log('\n📍 Your Pickup Locations:');
      console.log(JSON.stringify(locations, null, 2));
      
      if (locations.data && Array.isArray(locations.data)) {
        console.log('\n✅ Available Location IDs:');
        locations.data.forEach(loc => {
          console.log(`  - ID: ${loc.id}, Name: ${loc.warehouse_name}, Primary: ${loc.is_primary ? '✅' : '❌'}`);
        });
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  process.exit(0);
}

test();
