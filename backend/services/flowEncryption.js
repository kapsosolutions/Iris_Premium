import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

let privateKey = null;
let publicKey = null;

export function initKeys() {
  const keysDir = path.join(process.cwd(), 'keys');
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }

  const privPath = path.join(keysDir, 'private.pem');
  const pubPath = path.join(keysDir, 'public.pem');

  if (fs.existsSync(privPath) && fs.existsSync(pubPath)) {
    privateKey = fs.readFileSync(privPath, 'utf8');
    publicKey = fs.readFileSync(pubPath, 'utf8');
  } else {
    console.log('🔑 Generating fresh PKCS#1 RSA 2048-bit Keypair for Meta Flow Encryption...');
    const { privateKey: priv, publicKey: pub } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
    });
    fs.writeFileSync(privPath, priv);
    fs.writeFileSync(pubPath, pub);
    privateKey = priv;
    publicKey = pub;
    console.log('✅ PKCS#1 RSA Keypair created successfully in backend/keys/');
  }

  return { privateKey, publicKey };
}

export function decryptMetaRequest(body) {
  const keysDir = path.join(process.cwd(), 'keys');
  const privPath = path.join(keysDir, 'private.pem');
  if (fs.existsSync(privPath)) {
    privateKey = fs.readFileSync(privPath, 'utf8');
  } else {
    initKeys();
  }

  const { encrypted_flow_data, encrypted_aes_key, initial_vector } = body;
  if (!encrypted_flow_data || !encrypted_aes_key || !initial_vector) {
    return { decryptedData: body, aesKeyBuffer: null, ivBuffer: null };
  }

  const aesKeyEncryptedBuf = Buffer.from(encrypted_aes_key, 'base64');
  let aesKeyBuffer = null;

  // Try OAEP SHA-256 + MGF1 SHA-256
  try {
    aesKeyBuffer = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
        mgf1Hash: 'sha256'
      },
      aesKeyEncryptedBuf
    );
    console.log('✅ Decrypted AES key length (SHA-256/MGF1-256):', aesKeyBuffer.length);
  } catch (e1) {
    console.error('OAEP SHA256/MGF1-256 failed:', e1.message);
    try {
      aesKeyBuffer = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
          mgf1Hash: 'sha1'
        },
        aesKeyEncryptedBuf
      );
      console.log('✅ Decrypted AES key length (SHA-256/MGF1-1):', aesKeyBuffer.length);
    } catch (e2) {
      console.error('OAEP SHA256/MGF1-1 failed:', e2.message);
      try {
        aesKeyBuffer = crypto.privateDecrypt(
          {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha1'
          },
          aesKeyEncryptedBuf
        );
        console.log('✅ Decrypted AES key length (SHA1):', aesKeyBuffer.length);
      } catch (e3) {
        console.error('OAEP SHA1 failed:', e3.message);
      }
    }
  }

  if (!aesKeyBuffer || (aesKeyBuffer.length !== 16 && aesKeyBuffer.length !== 32)) {
    throw new Error(`Invalid decrypted AES key length: ${aesKeyBuffer ? aesKeyBuffer.length : 'null'}`);
  }

  // 2. Decrypt Flow Data using dynamic AES algorithm
  const flowDataBuffer = Buffer.from(encrypted_flow_data, 'base64');
  const ivBuffer = Buffer.from(initial_vector, 'base64');

  const algo = aesKeyBuffer.length === 16 ? 'aes-128-gcm' : 'aes-256-gcm';

  const authTag = flowDataBuffer.subarray(flowDataBuffer.length - 16);
  const encryptedData = flowDataBuffer.subarray(0, flowDataBuffer.length - 16);

  const decipher = crypto.createDecipheriv(algo, aesKeyBuffer, ivBuffer);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, null, 'utf8');
  decrypted += decipher.final('utf8');

  return {
    decryptedData: JSON.parse(decrypted),
    aesKeyBuffer,
    ivBuffer
  };
}

export function encryptMetaResponse(responseObj, aesKeyBuffer, ivBuffer) {
  const responseString = JSON.stringify(responseObj);

  // Invert IV bytes for response encryption as per Meta specification
  const flippedIv = Buffer.alloc(ivBuffer.length);
  for (let i = 0; i < ivBuffer.length; i++) {
    flippedIv[i] = ivBuffer[i] ^ 0xFF;
  }

  const algo = aesKeyBuffer.length === 16 ? 'aes-128-gcm' : 'aes-256-gcm';

  const cipher = crypto.createCipheriv(algo, aesKeyBuffer, flippedIv);
  let encrypted = cipher.update(responseString, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag().toString('base64');
  
  // Combine encrypted data and authTag
  const combined = Buffer.concat([
    Buffer.from(encrypted, 'base64'),
    Buffer.from(authTag, 'base64')
  ]).toString('base64');

  return combined;
}

export default { initKeys, decryptMetaRequest, encryptMetaResponse };
