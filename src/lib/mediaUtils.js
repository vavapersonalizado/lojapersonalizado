
export const isVideo = (url) => {
    if (!url) return false;
    // Check for Cloudinary video path or common video extensions
    return url.includes('/video/upload/') ||
        /\.(mp4|webm|ogg|mov)$/i.test(url);
};

export const is3D = (url) => {
    if (!url) return false;
    return /\.(glb|gltf)$/i.test(url);
};

export const getMediaType = (url) => {
    if (isVideo(url)) return 'video';
    if (is3D(url)) return '3d';
    return 'image';
};
