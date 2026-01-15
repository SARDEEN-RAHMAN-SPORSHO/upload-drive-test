// Simple Google Drive uploader using service account
// Note: This is for TESTING only. In production, use a backend.

interface UploadResponse {
  success: boolean;
  fileId?: string;
  fileName?: string;
  error?: string;
  link?: string;
}

export async function uploadToDrive(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
  try {
    console.log('Starting upload...', file.name);
    
    // Get service account from environment
    const serviceAccount = JSON.parse(import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT || '{}');
    const folderId = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;
    
    if (!serviceAccount.private_key) {
      throw new Error('Service account credentials not found');
    }

    // Step 1: Get access token using service account
    const accessToken = await getAccessToken(serviceAccount);
    
    // Step 2: Prepare file metadata
    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: folderId ? [folderId] : []
    };

    // Step 3: Create form data
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    // Step 4: Upload to Google Drive
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: form,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Upload failed');
    }

    const data = await response.json();
    
    return {
      success: true,
      fileId: data.id,
      fileName: data.name,
      link: `https://drive.google.com/file/d/${data.id}/view`
    };

  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

async function getAccessToken(serviceAccount: any): Promise<string> {
  try {
    // Create JWT token
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const claimSet = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/drive.file',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // Encode JWT
    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
    const encodedClaimSet = btoa(JSON.stringify(claimSet)).replace(/=/g, '');
    const toSign = `${encodedHeader}.${encodedClaimSet}`;
    
    // Note: In a real app, you should use a proper JWT library and NEVER expose private key in frontend
    // This is just for testing
    console.warn('WARNING: This is a testing implementation. Do not use in production!');
    
    // For testing, we'll use a simpler approach
    return await getAccessTokenSimple(serviceAccount);
    
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Simplified token fetching (for testing only)
async function getAccessTokenSimple(serviceAccount: any): Promise<string> {
  // This is a simplified version. In real app, use proper JWT signing
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: 'test-assertion' // In real app, this should be properly signed JWT
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get access token');
  }

  return data.access_token;
}

// List files in folder
export async function listFiles(): Promise<any[]> {
  try {
    const serviceAccount = JSON.parse(import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT || '{}');
    const folderId = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;
    const accessToken = await getAccessTokenSimple(serviceAccount);

    let query = "mimeType != 'application/vnd.google-apps.folder'";
    if (folderId) {
      query = `'${folderId}' in parents and ${query}`;
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink,createdTime,size)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}
