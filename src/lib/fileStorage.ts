// src/lib/fileStorage.ts
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// Define a type for upload options
interface UploadOptions {
  directory?: string;
  customName?: string;
  visibility?: 'public' | 'private';
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseClient = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Upload a file to the storage system (local or Supabase)
 */
export async function uploadFile(file: File, options: UploadOptions = {}): Promise<string> {
  // Default options
  const directory = options.directory || 'uploads';
  const visibility = options.visibility || 'private';
  
  // Choose storage method based on environment
  if (process.env.STORAGE_DRIVER === 'supabase' && supabaseClient) {
    return uploadToSupabase(file, directory, visibility, options.customName);
  } else {
    return uploadToLocal(file, directory, options.customName);
  }
}

/**
 * Upload a file to Supabase Storage
 */
async function uploadToSupabase(
  file: File, 
  directory: string, 
  visibility: 'public' | 'private',
  customName?: string
): Promise<string> {
  if (!supabaseClient) {
    throw new Error('Supabase client not configured');
  }
  
  // Generate file path
  const fileName = customName || `${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
  const filePath = `${directory}/${fileName}`;
  
  // Read file data
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Set the bucket name based on visibility
  const bucket = visibility === 'public' ? 'public' : 'private';
  
  // Upload to Supabase
  const { data, error } = await supabaseClient
    .storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    throw new Error(`Supabase storage error: ${error.message}`);
  }
  
  if (!data) {
    throw new Error('Failed to upload file to Supabase storage');
  }
  
  // Return the URL to the file
  if (visibility === 'public') {
    const { data: publicUrl } = supabaseClient
      .storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return publicUrl.publicUrl;
  }
  
  // For private files, return the path that can be used to generate a signed URL
  return `${bucket}/${filePath}`;
}

/**
 * Upload a file to local storage (development only)
 */
async function uploadToLocal(file: File, directory: string, customName?: string): Promise<string> {
  // Create directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'public', directory);
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Generate file path
  const fileName = customName || `${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
  const filePath = path.join(uploadsDir, fileName);
  
  // Read file data
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Write file to disk
  fs.writeFileSync(filePath, buffer);
  
  // Return the URL path to the file
  return `/${directory}/${fileName}`;
}

/**
 * Generate a signed URL for a private file
 */
export async function getSignedUrl(filePath: string, expiresIn = 60): Promise<string> {
  if (!supabaseClient) {
    throw new Error('Supabase client not configured');
  }
  
  const [bucket, ...pathParts] = filePath.split('/');
  const path = pathParts.join('/');
  
  const { data, error } = await supabaseClient
    .storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  
  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
  
  if (!data?.signedUrl) {
    throw new Error('Failed to generate signed URL');
  }
  
  return data.signedUrl;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(fileUrl: string): Promise<boolean> {
  if (process.env.STORAGE_DRIVER === 'supabase' && supabaseClient) {
    return deleteFromSupabase(fileUrl);
  } else {
    return deleteFromLocal(fileUrl);
  }
}

/**
 * Delete a file from Supabase storage
 */
async function deleteFromSupabase(filePath: string): Promise<boolean> {
  if (!supabaseClient) {
    throw new Error('Supabase client not configured');
  }
  
  // Extract bucket and path
  let bucket: string;
  let path: string;
  
  if (filePath.startsWith('http')) {
    // If it's a public URL, extract the path from the URL
    const url = new URL(filePath);
    const pathParts = url.pathname.split('/');
    // Format is usually /storage/v1/object/public/[bucket]/[filename]
    // Find the index of 'public' and the bucket is right after it
    const publicIndex = pathParts.findIndex(part => part === 'public');
    if (publicIndex !== -1 && pathParts.length > publicIndex + 1) {
      bucket = pathParts[publicIndex + 1];
      path = pathParts.slice(publicIndex + 2).join('/');
    } else {
      throw new Error('Invalid Supabase file URL format');
    }
  } else {
    // If it's a stored path like "bucket/path/to/file"
    const parts = filePath.split('/');
    bucket = parts[0];
    path = parts.slice(1).join('/');
  }
  
  // Delete from Supabase
  const { error } = await supabaseClient
    .storage
    .from(bucket)
    .remove([path]);
  
  if (error) {
    console.error('Error deleting file from Supabase:', error);
    return false;
  }
  
  return true;
}

/**
 * Delete a file from local storage
 */
async function deleteFromLocal(fileUrl: string): Promise<boolean> {
  try {
    // Convert URL path to file system path
    const filePath = path.join(process.cwd(), 'public', fileUrl.replace(/^\//, ''));
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting local file:', error);
    return false;
  }
}

/**
 * List files in a directory
 */
export async function listFiles(directory: string, bucket: string = 'public'): Promise<string[]> {
  if (process.env.STORAGE_DRIVER === 'supabase' && supabaseClient) {
    return listSupabaseFiles(directory, bucket);
  } else {
    return listLocalFiles(directory);
  }
}

/**
 * List files in a Supabase storage directory
 */
async function listSupabaseFiles(directory: string, bucket: string): Promise<string[]> {
  if (!supabaseClient) {
    throw new Error('Supabase client not configured');
  }
  
  const { data, error } = await supabaseClient
    .storage
    .from(bucket)
    .list(directory);
  
  if (error) {
    console.error('Error listing files from Supabase:', error);
    return [];
  }
  
  return data.map(item => `${bucket}/${directory}/${item.name}`);
}

/**
 * List files in a local directory
 */
async function listLocalFiles(directory: string): Promise<string[]> {
  try {
    const dirPath = path.join(process.cwd(), 'public', directory);
    
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    
    const files = fs.readdirSync(dirPath);
    return files.map(file => `/${directory}/${file}`);
  } catch (error) {
    console.error('Error listing local files:', error);
    return [];
  }
}