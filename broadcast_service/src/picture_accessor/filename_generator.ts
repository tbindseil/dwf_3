export default function generatePictureFilename(
    pictureName: string,
    createdBy: string
): string {
    const createdAt = new Date().toString().replaceAll(' ', '__');
    return `${pictureName}_${createdBy}_${createdAt}.png`;
}
