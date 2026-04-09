import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const initialProphecies = [
  {
    title: "The Scattering of the True Israelites",
    description: "The fulfillment of Deuteronomy 28:68 through the Transatlantic Slave Trade, where the children of Israel were taken into Egypt (bondage) again with ships.",
    scripture_anchor: "Deuteronomy 28:68",
    verse_text: "And Yahuah shall bring thee into Egypt again with ships, by the way whereof I spake unto thee, Thou shalt see it no more again: and there ye shall be sold unto your enemies for bondmen and bondwomen, and no man shall buy you.",
    status: "FULFILLED",
    confidence: "CERTAIN",
    timeline_section: "THE_SCATTERING_CONTINUES"
  },
  {
    title: "Wars and Rumors of Wars",
    description: "Global increase in military conflicts, airstrikes, and the buildup of tensions between major world powers as signs of the times.",
    scripture_anchor: "Matthew 24:6",
    verse_text: "And ye shall hear of wars and rumours of wars: see that ye be not troubled: for all these things must come to pass, but the end is not yet.",
    status: "IN_PROGRESS",
    confidence: "PROBABLE",
    timeline_section: "SIGNS_OF_THE_TIMES"
  },
  {
    title: "The Rise of the Beast System",
    description: "The consolidation of global governance, international authorities, and the push for global tracking systems.",
    scripture_anchor: "Revelation 13:7",
    verse_text: "And it was given unto him to make war with the saints, and to overcome them: and power was given him over all kindreds, and tongues, and nations.",
    status: "WATCHING",
    confidence: "PROBABLE",
    timeline_section: "BEAST_SYSTEM_RISING"
  },
  {
    title: "The Second Exodus & Restoration",
    description: "The awakening of the scattered tribes of Israel and their return to the covenant land.",
    scripture_anchor: "Ezekiel 37:21",
    verse_text: "And say unto them, Thus saith Yahuah Elohim; Behold, I will take the children of Israel from among the heathen, whither they be gone, and will gather them on every side, and bring them into their own land.",
    status: "PENDING",
    confidence: "CERTAIN",
    timeline_section: "ISRAELS_RESTORATION"
  }
];

async function seed() {
  console.log('Seeding prophecy_tracker...');
  
  // Check if already seeded
  const { data: existing } = await supabase.from('prophecy_tracker').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('prophecy_tracker already has data. Skipping seed.');
    return;
  }

  const { error } = await supabase
    .from('prophecy_tracker')
    .insert(initialProphecies);

  if (error) {
    console.error('Error seeding tracker:', error);
  } else {
    console.log('Successfully seeded prophecy_tracker.');
  }
}

seed();
