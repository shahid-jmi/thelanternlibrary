import cloudinary from '../../config/cloudinary.js';

const BOOK_COVERS_FOLDER = 'book-covers';

export const uploadCoverImageAsset = (buffer) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: BOOK_COVERS_FOLDER,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });

export const deleteCoverImageAsset = (publicId) => cloudinary.uploader.destroy(publicId);
