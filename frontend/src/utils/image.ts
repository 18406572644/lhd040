export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const isBase64Image = (str: string): boolean => {
  return typeof str === 'string' && str.startsWith('data:image/');
};

export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  return isBase64Image(url) || url.startsWith('http') || url.startsWith('blob:');
};
