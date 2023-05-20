export default function generatePictureFilename(
    pictureName: string,
    createdBy: string
): string {
    const createdAt = new Date().toString()
    return `${pictureName}_${createdBy}_${createdAt}.png`
}
