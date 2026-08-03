/**
 * Diagnostic tool to check TTS voice availability for Hindi (hi-IN) and Marathi (mr-IN).
 */
import * as Speech from 'expo-speech';

async function checkVoices() {
  console.log('--- EXPO SPEECH VOICE AVAILABILITY CHECK ---');
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    console.log(`Total TTS voices available on system: ${voices.length}`);

    const hindiVoices = voices.filter(
      (v) =>
        (v.language && v.language.toLowerCase().includes('hi')) ||
        (v.name && v.name.toLowerCase().includes('hindi'))
    );

    const marathiVoices = voices.filter(
      (v) =>
        (v.language && v.language.toLowerCase().includes('mr')) ||
        (v.name && v.name.toLowerCase().includes('marathi'))
    );

    console.log('\n=== HINDI (hi-IN / hi) VOICES ===');
    if (hindiVoices.length > 0) {
      hindiVoices.forEach((v) => {
        console.log(`  - Name: "${v.name}", Language: "${v.language}", Identifier: "${v.identifier}"`);
      });
    } else {
      console.log('  ⚠️ NO NATIVE HINDI TTS VOICES INSTALLED ON THIS DEVICE/ENVIRONMENT.');
    }

    console.log('\n=== MARATHI (mr-IN / mr) VOICES ===');
    if (marathiVoices.length > 0) {
      marathiVoices.forEach((v) => {
        console.log(`  - Name: "${v.name}", Language: "${v.language}", Identifier: "${v.identifier}"`);
      });
    } else {
      console.log('  ⚠️ NO NATIVE MARATHI TTS VOICES INSTALLED ON THIS DEVICE/ENVIRONMENT.');
    }

    console.log('\n=== ALL SYSTEM VOICES LIST ===');
    voices.forEach((v, idx) => {
      console.log(`[${idx + 1}] Name: "${v.name}", Language: "${v.language}"`);
    });
  } catch (err) {
    console.error('Error fetching available TTS voices:', err);
  }
}

checkVoices();
