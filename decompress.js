import { NodeIO } from '@gltf-transform/core';
import { dequantize } from '@gltf-transform/functions';
import * as meshopt from 'meshoptimizer';

async function decompress() {
const io = new NodeIO()
  .registerDependencies({
    'meshopt.decoder': meshopt,
  });

  // Read the compressed GLB
  const document = await io.read('public/ferris_final.glb');

  // Dequantize for Blender compatibility
  await document.transform(
    dequantize()
  );

  // Write the decompressed GLB
  await io.write('public/ferris_final_decompressed.glb', document);
}

decompress().catch(console.error);